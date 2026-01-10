<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="rules"
    @reset="handleReset"
    @search="handleSearch"
  />
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { STATUS_OPTIONS } from '@/constants/enums'

  interface Props {
    modelValue: Record<string, any>
  }
  interface Emits {
    (e: 'update:modelValue', value: Record<string, any>): void
    (e: 'search', params: Record<string, any>): void
    (e: 'reset'): void
  }
  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 省份选项（从mock数据中提取）
  const provinceOptions = ref<string[]>([])
  // 城市选项
  const cityOptions = ref<string[]>([])
  // 区县选项
  const districtOptions = ref<string[]>([])

  // 表单数据双向绑定
  const searchBarRef = ref()
  const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  // 校验规则
  const rules = {}

  // 表单配置
  const formItems = computed(() => [
    {
      label: '关键词',
      key: 'keyword',
      type: 'input',
      placeholder: '搜索地址名称或详细地址',
      clearable: true
    },
    {
      label: '省',
      key: 'province',
      type: 'select',
      props: {
        clearable: true,
        filterable: true,
        placeholder: '选择省份',
        options: provinceOptions.value.map((province) => ({ label: province, value: province }))
      }
    },
    {
      label: '市',
      key: 'city',
      type: 'select',
      props: {
        clearable: true,
        filterable: true,
        placeholder: '选择城市',
        options: cityOptions.value.map((city) => ({ label: city, value: city }))
      }
    },
    {
      label: '区/县',
      key: 'district',
      type: 'select',
      props: {
        clearable: true,
        filterable: true,
        placeholder: '选择区/县',
        options: districtOptions.value.map((district) => ({ label: district, value: district }))
      }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        clearable: true,
        placeholder: '选择状态',
        options: STATUS_OPTIONS
      }
    }
  ])

  // 事件
  function handleReset() {
    emit('reset')
  }

  async function handleSearch() {
    await searchBarRef.value.validate()
    emit('search', formData.value)
  }

  // 暴露方法供父组件调用，用于更新选项
  defineExpose({
    updateOptions: (provinces: string[], cities: string[], districts: string[]) => {
      provinceOptions.value = provinces
      cityOptions.value = cities
      districtOptions.value = districts
    }
  })
</script>
