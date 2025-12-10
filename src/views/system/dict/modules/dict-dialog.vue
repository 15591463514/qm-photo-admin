<!-- 字典对话框组件 -->
<template>
  <ElDialog
    v-model="visible"
    :title="props.type === 'add' ? '新增字典' : '编辑字典'"
    width="600px"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="110px">
      <ElFormItem label="类型名称" prop="typeName">
        <ElSelect
          v-model="formData.typeName"
          :disabled="props.type === 'edit' || !!props.presetTypeName"
          filterable
          clearable
          allow-create
          placeholder="请选择或输入字典类型名称"
          @change="handleTypeNameChange"
        >
          <ElOption
            v-for="type in dictTypeOptions"
            :key="type.typeCode"
            :label="type.typeName"
            :value="type.typeName"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="类型编码" prop="typeCode">
        <ElInput
          v-model="formData.typeCode"
          placeholder="请输入字典类型编码"
          :disabled="props.type === 'edit' || isTypeNameFromStore || !!props.presetTypeCode"
        />
      </ElFormItem>
      <ElFormItem label="字典标签" prop="dataLabel">
        <ElInput v-model="formData.dataLabel" placeholder="请输入字典标签" />
      </ElFormItem>
      <ElFormItem label="字典值" prop="dataValue">
        <ElInput v-model="formData.dataValue" placeholder="请输入字典值" />
      </ElFormItem>
      <ElFormItem label="排序" prop="sortOrder">
        <ElInputNumber
          v-model="formData.sortOrder"
          :min="0"
          placeholder="请输入排序"
          style="width: 100%"
        />
      </ElFormItem>
      <ElFormItem label="状态" prop="status">
        <ElRadioGroup v-model="formData.status" style="width: 100%">
          <ElRadio :label="EnableStatus.ENABLED">启用</ElRadio>
          <ElRadio :label="EnableStatus.DISABLED">禁用</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="标签样式" prop="tagStyle">
        <ElInput v-model="formData.tagStyle" placeholder="请输入标签样式，如：success、danger" />
      </ElFormItem>
      <ElFormItem label="是否默认值" prop="isDefault">
        <ElSwitch v-model="formData.isDefault" />
      </ElFormItem>
      <ElFormItem label="备注" prop="remark">
        <ElInput v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="visible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确定</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, watch, computed, nextTick } from 'vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { DialogType } from '@/types'
  import { EnableStatus } from '@/constants/enums'
  import { useDictStore } from '@/store/modules/dict'
  import { createDictCodeValidator } from '@/utils/form/validator'

  defineOptions({ name: 'DictDialog' })

  const props = defineProps<{
    visible: boolean
    type: DialogType
    editData?: Api.SystemManage.DictData | null
    presetTypeCode?: string // 预设的类型编码（用于从类型节点新增时）
    presetTypeName?: string // 预设的类型名称（用于从类型节点新增时）
  }>()

  const emit = defineEmits<{
    'update:visible': [value: boolean]
    submit: [data: Api.SystemManage.CreateDictParams | Api.SystemManage.UpdateDictParams]
  }>()

  const formRef = ref<FormInstance>()
  const dictStore = useDictStore()

  const visible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  // 从 store 获取所有字典类型选项（去重）
  const dictTypeOptions = computed(() => {
    const typeMap = new Map<string, { typeCode: string; typeName: string }>()
    dictStore.treeData.forEach((item) => {
      if (!typeMap.has(item.typeCode)) {
        typeMap.set(item.typeCode, {
          typeCode: item.typeCode,
          typeName: item.typeName
        })
      }
    })
    return Array.from(typeMap.values())
  })

  // 判断当前类型名称是否来自 store
  const isTypeNameFromStore = computed(() => {
    if (!formData.value.typeName) return false
    return dictTypeOptions.value.some((type) => type.typeName === formData.value.typeName)
  })

  // 当前字典类型的最大的排序
  const maxSortOrder = computed(() => {
    const currentType = dictStore.treeData.find((item) => item.typeCode === props.presetTypeCode)
    return currentType?.children?.reduce((max, item) => Math.max(max, item.sortOrder), 0) || 0
  })

  /**
   * 处理类型名称变化
   * 如果选择的是已有的类型名称，自动填充类型编码
   */
  const handleTypeNameChange = (typeName: string) => {
    if (!typeName) return

    const selectedType = dictTypeOptions.value.find((type) => type.typeName === typeName)
    if (selectedType) {
      // 如果选择的是已有的类型，自动填充类型编码
      formData.value.typeCode = selectedType.typeCode
    } else {
      // 如果是新建的类型名称，清空类型编码让用户手动输入
      // 但只在新增模式下清空，编辑模式下不清空
      if (props.type === 'add') {
        formData.value.typeCode = ''
      }
    }

    // 重新验证typeCode
    formRef.value?.validateField('typeCode')
  }

  const getDefaultFormData = (): Api.SystemManage.CreateDictParams => {
    return {
      typeCode: '',
      typeName: '',
      dataLabel: '',
      dataValue: '',
      sortOrder: 1,
      status: EnableStatus.ENABLED,
      tagStyle: '',
      isDefault: false,
      remark: ''
    }
  }

  const formData = ref<Api.SystemManage.CreateDictParams>(getDefaultFormData())

  const rules: FormRules = {
    typeCode: [
      { required: true, message: '请输入字典类型编码', trigger: 'blur' },
      { validator: createDictCodeValidator('字典类型编码'), trigger: 'blur' }
    ],
    typeName: [{ required: true, message: '请输入字典类型名称', trigger: 'blur' }],
    dataLabel: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
    dataValue: [
      { required: true, message: '请输入字典值', trigger: 'blur' },
      { validator: createDictCodeValidator('字典值', { allowNumbers: true }), trigger: 'blur' }
    ],
    sortOrder: [{ required: true, message: '请输入排序', trigger: 'blur' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]
  }

  /**
   * 初始化表单数据
   */
  const initFormData = () => {
    if (props.type === 'edit' && props.editData) {
      Object.assign(formData.value, props.editData)
    } else {
      Object.assign(formData.value, getDefaultFormData())
      // 如果有预设的类型编码和名称，使用预设值
      if (props.presetTypeCode && props.presetTypeName) {
        formData.value.typeCode = props.presetTypeCode
        formData.value.typeName = props.presetTypeName
      }
    }
    // 重置表单验证状态
    nextTick(() => {
      formRef.value?.clearValidate()
    })
  }

  /**
   * 处理提交
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      emit('submit', { ...formData.value })
    } catch (error) {
      console.error('表单验证失败', error)
    }
  }

  watch(maxSortOrder, (newVal) => {
    if (newVal) {
      formData.value.sortOrder = newVal + 1
    }
  })

  watch(
    () => [props.visible, props.presetTypeCode, props.presetTypeName],
    ([visible]) => {
      if (visible) {
        initFormData()
      }
    },
    { immediate: true }
  )
</script>
