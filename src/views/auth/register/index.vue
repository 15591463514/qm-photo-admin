<!-- 注册页面 -->
<template>
  <div class="flex w-full h-screen">
    <LoginLeftView />

    <div class="relative flex-1">
      <AuthTopBar />

      <div class="auth-right-wrap">
        <div class="form">
          <h3 class="title">{{ $t('register.title') }}</h3>
          <p class="sub-title">{{ $t('register.subTitle') }}</p>
          <ElForm
            class="mt-7.5"
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-position="top"
            :key="formKey"
          >
            <ElFormItem prop="username">
              <ElInput
                class="custom-height"
                v-model.trim="formData.username"
                :placeholder="$t('register.placeholder.username')"
              />
            </ElFormItem>

            <ElFormItem prop="password">
              <ElInput
                class="custom-height"
                v-model.trim="formData.password"
                :placeholder="$t('register.placeholder.password')"
                type="password"
                autocomplete="off"
                show-password
              />
            </ElFormItem>

            <ElFormItem prop="confirmPassword">
              <ElInput
                class="custom-height"
                v-model.trim="formData.confirmPassword"
                :placeholder="$t('register.placeholder.confirmPassword')"
                type="password"
                autocomplete="off"
                show-password
              />
            </ElFormItem>

            <ElFormItem prop="email">
              <ElInput
                class="custom-height"
                v-model.trim="formData.email"
                placeholder="请输入邮箱地址"
                type="email"
                autocomplete="off"
              />
            </ElFormItem>

            <ElFormItem prop="verificationCode">
              <div class="flex gap-2">
                <ElInput
                  class="custom-height flex-1"
                  v-model.trim="formData.verificationCode"
                  placeholder="请输入验证码"
                  type="text"
                  autocomplete="off"
                  maxlength="4"
                  @keyup.enter="register"
                />
                <ElButton
                  class="custom-height"
                  :disabled="countdown > 0 || !formData.email"
                  @click="sendVerificationCode"
                  :loading="sendingCode"
                >
                  {{ countdown > 0 ? `${countdown}秒` : '发送验证码' }}
                </ElButton>
              </div>
            </ElFormItem>

            <ElFormItem prop="agreement">
              <ElCheckbox v-model="formData.agreement">
                {{ $t('register.agreeText') }}
                <RouterLink
                  style="color: var(--theme-color); text-decoration: none"
                  to="/privacy-policy"
                  >{{ $t('register.privacyPolicy') }}</RouterLink
                >
              </ElCheckbox>
            </ElFormItem>

            <div style="margin-top: 15px">
              <ElButton
                class="w-full custom-height"
                type="primary"
                @click="register"
                :loading="loading"
                v-ripple
              >
                {{ $t('register.submitBtnText') }}
              </ElButton>
            </div>

            <div class="mt-5 text-sm text-g-600">
              <span>{{ $t('register.hasAccount') }}</span>
              <RouterLink class="text-theme" :to="{ name: 'Login' }">{{
                $t('register.toLogin')
              }}</RouterLink>
            </div>
          </ElForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import type { FormInstance, FormRules } from 'element-plus'
  import { fetchRegister, fetchSendVerificationCode, fetchGetUserInfo } from '@/api/auth'
  import { HttpError } from '@/utils/http/error'
  import { useUserStore } from '@/store/modules/user'

  defineOptions({ name: 'Register' })

  const userStore = useUserStore()

  interface RegisterForm {
    username: string
    password: string
    confirmPassword: string
    email: string
    verificationCode: string
    agreement: boolean
  }

  const USERNAME_MIN_LENGTH = 3
  const USERNAME_MAX_LENGTH = 20
  const PASSWORD_MIN_LENGTH = 8
  const COUNTDOWN_TIME = 60 // 倒计时时间（秒）

  const { t, locale } = useI18n()
  const router = useRouter()
  const formRef = ref<FormInstance>()

  const loading = ref(false)
  const sendingCode = ref(false)
  const countdown = ref(0)
  const formKey = ref(0)
  let countdownTimer: ReturnType<typeof setInterval> | null = null

  // 监听语言切换，重置表单
  watch(locale, () => {
    formKey.value++
  })

  const formData = reactive<RegisterForm>({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    verificationCode: '',
    agreement: false
  })

  // 组件卸载时清理定时器
  onUnmounted(() => {
    if (countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  })

  /**
   * 验证用户名格式
   * 字母开头，3-20位，支持字母、数字、下划线
   */
  const validateUsername = (_rule: any, value: string, callback: (error?: Error) => void) => {
    if (!value) {
      callback(new Error('请输入账号'))
      return
    }

    const trimmedValue = value.trim()

    // 检查长度（3-20个字符）
    if (trimmedValue.length < USERNAME_MIN_LENGTH || trimmedValue.length > USERNAME_MAX_LENGTH) {
      callback(new Error(`账号长度为${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH}个字符`))
      return
    }

    // 检查格式：字母开头，支持字母、数字、下划线
    const accountRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/
    if (!accountRegex.test(trimmedValue)) {
      callback(new Error('账号必须以字母开头，只能包含字母、数字和下划线'))
      return
    }

    callback()
  }

  /**
   * 验证密码
   * 至少8位，必须包含字母和数字
   */
  const validatePassword = (_rule: any, value: string, callback: (error?: Error) => void) => {
    if (!value) {
      callback(new Error(t('register.placeholder.password')))
      return
    }

    // 检查长度
    if (value.length < PASSWORD_MIN_LENGTH) {
      callback(new Error(`密码长度不能少于${PASSWORD_MIN_LENGTH}位`))
      return
    }

    // 检查是否包含字母和数字
    const hasLetter = /[a-zA-Z]/.test(value)
    const hasNumber = /\d/.test(value)

    if (!hasLetter || !hasNumber) {
      callback(new Error('密码必须包含字母和数字'))
      return
    }

    // 如果确认密码已填写，触发确认密码的验证
    if (formData.confirmPassword) {
      formRef.value?.validateField('confirmPassword')
    }

    callback()
  }

  /**
   * 验证确认密码
   * 检查确认密码是否与密码一致
   */
  const validateConfirmPassword = (
    _rule: any,
    value: string,
    callback: (error?: Error) => void
  ) => {
    if (!value) {
      callback(new Error(t('register.rule.confirmPasswordRequired')))
      return
    }

    if (value !== formData.password) {
      callback(new Error(t('register.rule.passwordMismatch')))
      return
    }

    callback()
  }

  /**
   * 验证邮箱格式
   */
  const validateEmail = (_rule: any, value: string, callback: (error?: Error) => void) => {
    if (!value) {
      callback(new Error('请输入邮箱地址'))
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      callback(new Error('邮箱地址格式不正确'))
      return
    }

    callback()
  }

  /**
   * 验证验证码
   */
  const validateVerificationCode = (
    _rule: any,
    value: string,
    callback: (error?: Error) => void
  ) => {
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
  }

  /**
   * 验证用户协议
   * 确保用户已勾选同意协议
   */
  const validateAgreement = (_rule: any, value: boolean, callback: (error?: Error) => void) => {
    if (!value) {
      callback(new Error(t('register.rule.agreementRequired')))
      return
    }
    callback()
  }

  const rules = computed<FormRules<RegisterForm>>(() => ({
    username: [{ required: true, validator: validateUsername, trigger: 'blur' }],
    password: [{ required: true, validator: validatePassword, trigger: 'blur' }],
    confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }],
    email: [{ required: true, validator: validateEmail, trigger: 'blur' }],
    verificationCode: [{ required: true, validator: validateVerificationCode, trigger: 'blur' }],
    agreement: [{ validator: validateAgreement, trigger: 'change' }]
  }))

  /**
   * 发送验证码
   */
  const sendVerificationCode = async () => {
    if (!formData.email) {
      ElMessage.warning('请先输入邮箱地址')
      return
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      ElMessage.warning('邮箱地址格式不正确')
      return
    }

    try {
      sendingCode.value = true

      await fetchSendVerificationCode({ email: formData.email })

      ElMessage.success('验证码已发送到您的邮箱')
      startCountdown()
    } catch (error) {
      // HttpError 的错误消息已经由 http 拦截器处理并显示
      console.error('[SendVerificationCode] Error:', error)
    } finally {
      sendingCode.value = false
    }
  }

  /**
   * 开始倒计时
   */
  const startCountdown = () => {
    countdown.value = COUNTDOWN_TIME

    if (countdownTimer) {
      clearInterval(countdownTimer)
    }

    countdownTimer = setInterval(() => {
      countdown.value--

      if (countdown.value <= 0) {
        if (countdownTimer) {
          clearInterval(countdownTimer)
          countdownTimer = null
        }
      }
    }, 1000)
  }

  /**
   * 注册用户
   * 验证表单后提交注册请求
   */
  const register = async () => {
    if (!formRef.value) return

    try {
      // 表单验证
      const valid = await formRef.value.validate()
      if (!valid) return

      loading.value = true

      // 注册请求
      const params: Api.Auth.RegisterParams = {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        verificationCode: formData.verificationCode
      }

      // HTTP 拦截器已经处理了错误情况，这里如果执行到这里说明注册成功
      // 拦截器返回的是 data 字段的内容，不是完整的响应对象
      const res = await fetchRegister(params)

      // 验证token
      if (!res.token) {
        throw new Error('注册失败 - 未收到 token')
      }

      // 存储 token 和登录状态（注册成功后自动登录）
      userStore.setToken(res.token, res.refreshToken)
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

      // 注册成功，显示成功消息并跳转到首页
      ElMessage.success(res.message || t('register.success') || '注册成功，已自动登录')

      // 跳转到首页
      router.push('/')
    } catch (error) {
      // 处理 HttpError
      if (error instanceof HttpError) {
        // HttpError 的错误消息已经由 http 拦截器处理并显示
        console.error('[Register] HttpError:', error)
      } else {
        // 处理其他错误（如表单验证失败）
        console.error('[Register] Unexpected error:', error)
        // 表单验证失败不需要显示错误消息，Element Plus 会自动显示
        if (error && typeof error === 'object' && 'message' in error) {
          // 如果是其他类型的错误，显示错误消息
          ElMessage.error(
            (error as Error).message || t('register.failed') || '注册失败，请稍后重试'
          )
        }
      }
    } finally {
      loading.value = false
    }
  }
</script>

<style scoped>
  @import '../login/style.css';
</style>
