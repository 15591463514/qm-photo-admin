<!-- 相册搜索组件 -->
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

  defineOptions({ name: 'AlbumSearch' })

  const props = defineProps<{
    modelValue: Api.Album.AlbumListParams
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: Api.Album.AlbumListParams]
    search: []
    reset: []
  }>()

  const formData = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const formItems = computed(() => [
    {
      label: '关键词',
      key: 'keyword',
      type: 'input',
      props: { clearable: true, placeholder: '搜索相册名称、描述、地址名称' }
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
