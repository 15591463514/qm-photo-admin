<template>
  <ElDialog v-model="dialogVisible" title="编辑用户" width="30%" align-center>
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <ElFormItem label="用户名" prop="username">
        <ElInput v-model="formData.username" placeholder="请输入用户名" disabled />
      </ElFormItem>
      <ElFormItem label="昵称" prop="nickName">
        <ElInput v-model="formData.nickName" placeholder="请输入昵称（选填）" />
      </ElFormItem>
      <ElFormItem label="性别" prop="gender">
        <ElSelect v-model="formData.gender">
          <ElOption label="男" value="male" />
          <ElOption label="女" value="female" />
          <ElOption label="未知" value="unknown" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="角色" prop="role">
        <ElSelect v-model="formData.role" multiple placeholder="请选择角色" :loading="roleLoading">
          <ElOption
            v-for="role in roleList"
            :key="role.roleId"
            :value="role.roleCode"
            :label="role.roleName"
          />
        </ElSelect>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">提交</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { fetchGetRoleList, fetchUpdateUser } from '@/api/system-manage'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'

  interface Props {
    visible: boolean
    type: string
    userData?: Partial<Api.SystemManage.UserListItem>
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 角色列表数据
  const roleList = ref<Api.SystemManage.RoleListItem[]>([])
  const roleLoading = ref(false)

  // 对话框显示控制
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  // 表单实例
  const formRef = ref<FormInstance>()

  // 表单数据
  const formData = reactive({
    username: '',
    nickName: '',
    gender: 'unknown',
    role: [] as string[]
  })

  // 表单验证规则
  const rules: FormRules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    nickName: [{ max: 50, message: '昵称长度不能超过50个字符', trigger: 'blur' }],
    gender: [{ required: true, message: '请选择性别', trigger: 'blur' }],
    role: [{ required: true, message: '请选择角色', trigger: 'blur' }]
  }

  /**
   * 获取角色列表
   */
  const fetchRoleList = async () => {
    try {
      roleLoading.value = true
      const response = await fetchGetRoleList({
        current: 1,
        size: 100
      })
      // request 函数已经解包了 BaseResponse，直接返回 data
      // 所以 response 就是 RoleList (PaginatedResponse<RoleListItem>)
      // RoleList 包含 records, current, size, total
      if (response?.records) {
        roleList.value = response.records
      }
    } catch (error) {
      console.error('获取角色列表失败:', error)
      ElMessage.error('获取角色列表失败')
    } finally {
      roleLoading.value = false
    }
  }

  /**
   * 初始化表单数据
   * 只支持编辑模式，用户通过注册新增
   */
  const initFormData = () => {
    const row = props.userData

    Object.assign(formData, {
      username: row?.userName || '',
      nickName: row?.nickName || '',
      gender: row?.userGender || 'unknown',
      role: Array.isArray(row?.userRoles) ? row.userRoles : []
    })
  }

  /**
   * 监听对话框状态变化
   * 当对话框打开时初始化表单数据并清除验证状态
   */
  watch(
    () => [props.visible, props.type, props.userData],
    ([visible]) => {
      if (visible) {
        initFormData()
        // 获取角色列表
        fetchRoleList()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    },
    { immediate: true }
  )

  /**
   * 提交表单
   * 验证通过后触发提交事件
   * 注意：只支持编辑，用户通过注册新增
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          // 只支持更新用户
          if (!props.userData?.id) {
            ElMessage.error('用户ID不存在')
            return
          }
          await fetchUpdateUser(props.userData.id, {
            nickName: formData.nickName || undefined,
            userGender: formData.gender,
            roleCodes: formData.role.length > 0 ? formData.role : []
          })
          ElMessage.success('更新成功')
          dialogVisible.value = false
          emit('submit')
        } catch (error) {
          // 错误已在拦截器中处理
          console.error('提交失败:', error)
        }
      }
    })
  }
</script>
