<!-- 字典搜索组件 -->
<template>
  <ArtSearchBar
    v-model="formData"
    :items="formItems"
    :showExpand="false"
    @reset="handleReset"
    @search="handleSearch"
  />
</template>

<script setup lang="ts">
  import { ENABLE_STATUS_OPTIONS } from '@/constants/enums'

  defineOptions({ name: 'DictSearch' })

  const props = defineProps<{
    modelValue: Api.SystemManage.DictTreeSearchParams
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: Api.SystemManage.DictTreeSearchParams]
    search: []
    reset: []
  }>()

  const formData = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const formItems = computed(() => [
    {
      label: '类型名称',
      key: 'typeName',
      type: 'input',
      props: { clearable: true, placeholder: '请输入字典类型名称' }
    },
    {
      label: '类型编码',
      key: 'typeCode',
      type: 'input',
      props: { clearable: true, placeholder: '请输入字典类型编码' }
    },
    {
      label: '类型状态',
      key: 'typeStatus',
      type: 'select',
      props: {
        clearable: true,
        placeholder: '请选择类型状态',
        options: ENABLE_STATUS_OPTIONS
      }
    },
    {
      label: '字典标签',
      key: 'dataLabel',
      type: 'input',
      props: { clearable: true, placeholder: '请输入字典标签' }
    },
    {
      label: '字典值',
      key: 'dataValue',
      type: 'input',
      props: { clearable: true, placeholder: '请输入字典值' }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        clearable: true,
        placeholder: '请选择状态',
        options: ENABLE_STATUS_OPTIONS
      }
    }
  ])

  const handleSearch = () => {
    emit('search')
  }

  const handleReset = () => {
    emit('reset')
  }
</script>
