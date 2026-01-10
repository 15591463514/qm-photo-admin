<!-- 标签搜索组件 -->
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
  import { computed } from 'vue'
  import { STATUS_OPTIONS } from '@/constants/enums'

  defineOptions({ name: 'TagSearch' })

  const props = defineProps<{
    modelValue: Api.Tag.TagTreeSearchParams
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: Api.Tag.TagTreeSearchParams]
    search: []
    reset: []
  }>()

  const formData = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const formItems = computed(() => [
    {
      label: '标签组名称',
      key: 'groupName',
      type: 'input',
      props: { clearable: true, placeholder: '请输入标签组名称' }
    },
    {
      label: '标签组代码',
      key: 'groupCode',
      type: 'input',
      props: { clearable: true, placeholder: '请输入标签组代码' }
    },
    {
      label: '标签组状态',
      key: 'groupStatus',
      type: 'select',
      props: {
        clearable: true,
        placeholder: '请选择标签组状态',
        options: STATUS_OPTIONS
      }
    },
    {
      label: '标签名',
      key: 'label',
      type: 'input',
      props: { clearable: true, placeholder: '请输入标签名' }
    },
    {
      label: '标签值',
      key: 'value',
      type: 'input',
      props: { clearable: true, placeholder: '请输入标签值' }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        clearable: true,
        placeholder: '请选择状态',
        options: STATUS_OPTIONS
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
