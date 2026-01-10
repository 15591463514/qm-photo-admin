<!-- 标签组编辑弹窗 -->
<template>
  <ElDialog
    v-model="dialogVisible"
    :title="props.type === 'add' ? '新增标签组' : '编辑标签组'"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <ElForm
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="110px"
      :label-position="'right'"
    >
      <ElFormItem label="标签组名称" prop="groupName">
        <ElInput v-model="formData.groupName" placeholder="请输入标签组名称" />
      </ElFormItem>

      <ElFormItem label="标签组代码" prop="groupCode">
        <ElInput
          v-model="formData.groupCode"
          placeholder="请输入标签组代码"
          :disabled="props.type === 'edit'"
        />
      </ElFormItem>

      <ElFormItem label="标签组状态" prop="groupStatus">
        <ElRadioGroup v-model="formData.groupStatus">
          <ElRadio :label="StatusEnum.ENABLED">启用</ElRadio>
          <ElRadio :label="StatusEnum.DISABLED">禁用</ElRadio>
        </ElRadioGroup>
      </ElFormItem>

      <ElFormItem label="描述" prop="description">
        <ElInput
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入描述"
        />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import { fetchUpdateTagGroup } from '@/api/tag'
  import { DialogType } from '@/types'
  import { StatusEnum } from '@/constants/enums'
  import { createDictNameValidator, createDictCodeValueValidator } from '@/utils/form/validator'

  const props = defineProps<{
    visible: boolean
    type: DialogType
    editData?: Api.Tag.TagTreeItem | null
  }>()

  const emit = defineEmits<{
    'update:visible': [value: boolean]
    submit: []
  }>()

  const formRef = ref<FormInstance>()
  const loading = ref(false)

  // 表单数据
  const formData = ref<Api.Tag.UpdateTagGroupParams>({
    groupCode: '',
    groupName: '',
    groupStatus: StatusEnum.ENABLED,
    description: ''
  })

  // 表单验证规则
  const rules: FormRules = {
    groupCode: [
      { required: true, message: '请输入标签组代码', trigger: 'blur' },
      { validator: createDictCodeValueValidator('标签组代码'), trigger: 'blur' }
    ],
    groupName: [
      { required: true, message: '请输入标签组名称', trigger: 'blur' },
      { validator: createDictNameValidator('标签组名称'), trigger: 'blur' }
    ],
    groupStatus: [{ required: true, message: '请选择标签组状态', trigger: 'change' }]
  }

  // 弹窗显示状态
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  // 重置表单
  const resetForm = () => {
    formData.value = {
      groupCode: '',
      groupName: '',
      groupStatus: StatusEnum.ENABLED,
      description: ''
    }
    formRef.value?.clearValidate()
  }

  // 初始化表单数据
  const initFormData = () => {
    if (props.type === 'edit' && props.editData) {
      formData.value = {
        groupCode: props.editData.groupCode,
        groupName: props.editData.groupName,
        groupStatus: props.editData.groupStatus,
        description: props.editData.children?.[0]?.description || ''
      }
    } else {
      resetForm()
    }
  }

  // 处理关闭
  const handleClose = () => {
    resetForm()
    dialogVisible.value = false
  }

  // 处理提交
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      loading.value = true

      if (props.type === 'edit' && props.editData) {
        await fetchUpdateTagGroup(props.editData.groupCode, formData.value)
        ElMessage.success('更新成功')
      }

      loading.value = false
      emit('submit')
      handleClose()
    } catch (error) {
      loading.value = false
      if (error !== 'cancel') {
        ElMessage.error(error instanceof Error ? error.message : '操作失败')
      }
    }
  }

  watch(
    () => props.visible,
    (visible) => {
      if (visible) {
        initFormData()
      }
    }
  )
</script>
