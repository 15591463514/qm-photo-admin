<!-- 登录页面 -->
<template>
  <div class="flex w-full h-screen">
    <LoginLeftView />

    <div class="relative flex-1">
      <AuthTopBar />

      <div class="auth-right-wrap">
        <div class="form">
          <h3 class="title">{{ $t('login.title') }}</h3>
          <p class="sub-title">{{ $t('login.subTitle') }}</p>
          <ElForm
            ref="formRef"
            :model="formData"
            :rules="rules"
            :key="formKey"
            @keyup.enter="handleSubmit"
            style="margin-top: 25px"
          >
            <!-- 角色选择功能已注释，前端登录不需要选择角色 -->
            <!-- <ElFormItem prop="account">
              <ElSelect v-model="formData.account" clearable filterable @change="setupAccount">
                <ElOption
                  v-for="account in accounts"
                  :key="account.key"
                  :label="account.label"
                  :value="account.key"
                >
                  <span>{{ account.label }}</span>
                </ElOption>
              </ElSelect>
            </ElFormItem> -->
            <ElFormItem prop="account">
              <ElInput
                class="custom-height"
                placeholder="请输入账号或邮箱"
                v-model.trim="formData.account"
              />
            </ElFormItem>
            <ElFormItem prop="password">
              <ElInput
                class="custom-height"
                :placeholder="$t('login.placeholder.password')"
                v-model.trim="formData.password"
                type="password"
                autocomplete="off"
                show-password
              />
            </ElFormItem>

            <ElFormItem prop="captchaText">
              <div class="flex gap-2">
                <ElInput
                  class="custom-height flex-1"
                  placeholder="请输入验证码"
                  v-model.trim="formData.captchaText"
                  type="text"
                  autocomplete="off"
                  maxlength="4"
                  @keyup.enter="handleSubmit"
                />
                <div
                  class="custom-height border border-gray-300 rounded cursor-pointer overflow-hidden flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
                  @click="refreshCaptcha"
                  v-html="captchaSvg"
                  style="width: 120px; min-width: 120px"
                ></div>
              </div>
            </ElFormItem>

            <div class="flex-cb mt-2 text-sm">
              <ElCheckbox v-model="formData.rememberPassword">{{
                $t('login.rememberPwd')
              }}</ElCheckbox>
              <RouterLink class="text-theme" :to="{ name: 'ForgetPassword' }">{{
                $t('login.forgetPwd')
              }}</RouterLink>
            </div>

            <div style="margin-top: 30px">
              <ElButton
                class="w-full custom-height"
                type="primary"
                @click="handleSubmit"
                :loading="loading"
                v-ripple
              >
                {{ $t('login.btnText') }}
              </ElButton>
            </div>

            <div class="mt-5 text-sm text-gray-600">
              <span>{{ $t('login.noAccount') }}</span>
              <RouterLink class="text-theme" :to="{ name: 'Register' }">{{
                $t('login.register')
              }}</RouterLink>
            </div>
          </ElForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useUserStore } from '@/store/modules/user'
  import { useI18n } from 'vue-i18n'
  import { HttpError } from '@/utils/http/error'
  import { fetchLogin, fetchGetUserInfo, fetchCaptcha } from '@/api/auth'
  import { ElNotification, type FormInstance, type FormRules } from 'element-plus'

  defineOptions({ name: 'Login' })

  const { t, locale } = useI18n()
  const formKey = ref(0)

  // 监听语言切换，重置表单
  watch(locale, () => {
    formKey.value++
  })

  // 角色选择相关代码已注释，前端登录不需要选择角色
  // type AccountKey = 'super' | 'admin' | 'user'

  // export interface Account {
  //   key: AccountKey
  //   label: string
  //   userName: string
  //   password: string
  //   roles: string[]
  // }

  // const accounts = computed<Account[]>(() => [
  //   {
  //     key: 'super',
  //     label: t('login.roles.super'),
  //     userName: 'Dawn',
  //     password: 'mm123456',
  //     roles: ['R_SUPER']
  //   },
  //   {
  //     key: 'admin',
  //     label: t('login.roles.admin'),
  //     userName: 'Admin',
  //     password: '123456',
  //     roles: ['R_ADMIN']
  //   },
  //   {
  //     key: 'user',
  //     label: t('login.roles.user'),
  //     userName: 'User',
  //     password: '123456',
  //     roles: ['R_USER']
  //   }
  // ])

  const userStore = useUserStore()
  const router = useRouter()
  const route = useRoute()

  const formRef = ref<FormInstance>()

  const formData = reactive({
    account: '',
    password: '',
    captchaId: '',
    captchaText: '',
    rememberPassword: true
  })

  const captchaSvg = ref('')
  const loadingCaptcha = ref(false)

  const ACCOUNT_MIN_LENGTH = 3

  const rules = computed<FormRules>(() => ({
    account: [
      { required: true, message: '请输入账号或邮箱', trigger: 'blur' },
      {
        validator: (_rule: any, value: string, callback: (error?: Error) => void) => {
          if (!value) {
            callback()
            return
          }

          const trimmedValue = value.trim()

          // 检查长度（至少3个字符）
          if (trimmedValue.length < ACCOUNT_MIN_LENGTH) {
            callback(new Error(`账号或邮箱长度不能少于${ACCOUNT_MIN_LENGTH}位`))
            return
          }

          // 如果是邮箱格式，验证邮箱格式
          if (trimmedValue.includes('@')) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(trimmedValue)) {
              callback(new Error('邮箱格式不正确'))
              return
            }
          }

          callback()
        },
        trigger: 'blur'
      }
    ],
    password: [{ required: true, message: t('login.placeholder.password'), trigger: 'blur' }],
    captchaText: [
      { required: true, message: '请输入验证码', trigger: 'blur' },
      {
        validator: (_rule: any, value: string, callback: (error?: Error) => void) => {
          if (!value) {
            callback(new Error('请输入验证码'))
            return
          }

          if (value.length !== 4) {
            callback(new Error('验证码长度为4位'))
            return
          }

          if (!/^\d{4}$/.test(value)) {
            callback(new Error('验证码必须是4位数字'))
            return
          }

          callback()
        },
        trigger: 'blur'
      }
    ]
  }))

  const loading = ref(false)

  /**
   * 获取验证码
   */
  const refreshCaptcha = async () => {
    try {
      loadingCaptcha.value = true
      const res = await fetchCaptcha()
      formData.captchaId = res.captchaId
      captchaSvg.value = res.svg
    } catch (error) {
      console.error('获取验证码失败:', error)
      ElMessage.error('获取验证码失败，请刷新页面重试')
    } finally {
      loadingCaptcha.value = false
    }
  }

  // 页面加载时获取验证码
  onMounted(() => {
    refreshCaptcha()
  })

  // 设置账号（角色选择功能已注释）
  // const setupAccount = (key: AccountKey) => {
  //   const selectedAccount = accounts.value.find((account: Account) => account.key === key)
  //   formData.account = key
  //   formData.username = selectedAccount?.userName ?? ''
  //   formData.password = selectedAccount?.password ?? ''
  // }

  // 登录
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      // 表单验证
      const valid = await formRef.value.validate()
      if (!valid) return

      loading.value = true

      // 登录请求
      const { account, password, captchaId, captchaText } = formData

      const { token, refreshToken } = await fetchLogin({
        account,
        password,
        captchaId,
        captchaText
      })

      // 验证token
      if (!token) {
        throw new Error('Login failed - no token received')
      }

      // 存储 token 和登录状态
      userStore.setToken(token, refreshToken)
      userStore.setLoginStatus(true)

      // 获取用户信息（包含权限）
      try {
        const userInfo = await fetchGetUserInfo()
        userStore.setUserInfo(userInfo)
        // 检查并清理工作台标签页（如果是不同用户登录）
        userStore.checkAndClearWorktabs()
      } catch (error) {
        console.error('获取用户信息失败:', error)
        // 即使获取用户信息失败，也允许登录，路由守卫会重新获取
      }

      // 登录成功处理
      showLoginSuccessNotice()

      // 获取 redirect 参数，如果存在则跳转到指定页面，否则跳转到首页
      const redirect = route.query.redirect as string
      router.push(redirect || '/')
    } catch (error) {
      // 处理 HttpError
      if (error instanceof HttpError) {
        // 如果验证码错误，刷新验证码
        if (error.message?.includes('验证码')) {
          refreshCaptcha()
          formData.captchaText = ''
        }
      } else {
        // 处理非 HttpError
        // ElMessage.error('登录失败，请稍后重试')
        console.error('[Login] Unexpected error:', error)
      }
    } finally {
      loading.value = false
    }
  }

  // 登录成功提示
  const showLoginSuccessNotice = () => {
    setTimeout(() => {
      ElNotification({
        title: t('login.success.title'),
        type: 'success',
        duration: 2500,
        zIndex: 10000,
        message: `${t('login.success.message')}, ${userStore.info?.nickName || userStore.info?.userName}!`
      })
    }, 1000)
  }
</script>

<style scoped>
  @import './style.css';
</style>

<style lang="scss" scoped>
  :deep(.el-select__wrapper) {
    height: 40px !important;
  }
</style>
