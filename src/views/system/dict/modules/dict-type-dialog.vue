<!-- 字典类型编辑弹窗 -->
<template>
  <ElDialog
    v-model="dialogVisible"
    :title="props.type === 'add' ? '新增字典类型' : '编辑字典类型'"
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
      <ElFormItem label="类型名称" prop="typeName">
        <ElInput v-model="formData.typeName" placeholder="请输入字典类型名称" />
      </ElFormItem>

      <ElFormItem label="类型编码" prop="typeCode">
        <ElInput
          v-model="formData.typeCode"
          placeholder="请输入字典类型编码"
          :disabled="props.type === 'edit'"
        />
      </ElFormItem>

      <ElFormItem label="类型状态" prop="typeStatus">
        <ElRadioGroup v-model="formData.typeStatus">
          <ElRadio :label="EnableStatus.ENABLED">启用</ElRadio>
          <ElRadio :label="EnableStatus.DISABLED">禁用</ElRadio>
        </ElRadioGroup>
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
  import { fetchUpdateDictType } from '@/api/dict'
  import { DialogType } from '@/types'
  import { EnableStatus } from '@/constants/enums'
  import { createDictNameValidator, createDictCodeValueValidator } from '@/utils/form/validator'

  const props = defineProps<{
    visible: boolean
    type: DialogType
    editData?: Api.SystemManage.DictTreeItem | null
  }>()

  const emit = defineEmits<{
    'update:visible': [value: boolean]
    submit: []
  }>()

  const formRef = ref<FormInstance>()
  const loading = ref(false)

  // 表单数据
  const formData = ref<Api.SystemManage.UpdateDictTypeParams>({
    typeCode: '',
    typeName: '',
    typeStatus: EnableStatus.ENABLED,
    remark: ''
  })

  // 表单验证规则
  const rules: FormRules = {
    typeCode: [
      { required: true, message: '请输入字典类型编码', trigger: 'blur' },
      { validator: createDictCodeValueValidator('字典类型编码'), trigger: 'blur' }
    ],
    typeName: [
      { required: true, message: '请输入字典类型名称', trigger: 'blur' },
      { validator: createDictNameValidator('字典类型名称'), trigger: 'blur' }
    ],
    typeStatus: [{ required: true, message: '请选择类型状态', trigger: 'change' }]
  }

  // 弹窗显示状态
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  // 重置表单
  const resetForm = () => {
    formData.value = {
      typeCode: '',
      typeName: '',
      typeStatus: EnableStatus.ENABLED,
      remark: ''
    }
    formRef.value?.resetFields()
  }

  // 监听编辑数据变化
  watch(
    () => props.editData,
    (data) => {
      if (data && props.type === 'edit') {
        formData.value = {
          typeCode: data.typeCode,
          typeName: data.typeName,
          typeStatus: data.typeStatus
        }
      } else {
        resetForm()
      }
    },
    { immediate: true }
  )

  // 监听弹窗显示状态
  watch(
    () => props.visible,
    (visible) => {
      if (visible) {
        if (props.type === 'add') {
          resetForm()
        }
      } else {
        formRef.value?.resetFields()
      }
    }
  )

  // 关闭弹窗
  const handleClose = () => {
    emit('update:visible', false)
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (!valid) return

      try {
        loading.value = true

        if (props.type === 'edit' && props.editData) {
          // 编辑字典类型
          await fetchUpdateDictType(props.editData.typeCode, formData.value)
          ElMessage.success('编辑成功')
        }

        emit('submit')
        handleClose()
      } catch (error: any) {
        ElMessage.error(error?.message || '操作失败')
      } finally {
        loading.value = false
      }
    })
  }
</script>
