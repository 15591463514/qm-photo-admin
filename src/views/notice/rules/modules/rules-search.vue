<template>
  <ElCard shadow="never" class="search-card">
    <ElForm :model="searchForm" :inline="true">
      <ElFormItem label="消息来源">
        <ElInput
          v-model="searchForm.msgSource"
          placeholder="请输入消息来源"
          clearable
          style="width: 200px"
        />
      </ElFormItem>
      <ElFormItem label="消息类型">
        <ElSelect
          v-model="searchForm.msgType"
          placeholder="请选择消息类型"
          clearable
          filterable
          style="width: 200px"
        >
          <ElOption
            v-for="option in msgTypeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem>
        <ElButton type="primary" @click="handleSearch">
          <template #icon>
            <ArtSvgIcon icon="ri:search-line" />
          </template>
          搜索
        </ElButton>
        <ElButton @click="handleReset">
          <template #icon>
            <ArtSvgIcon icon="ri:restart-line" />
          </template>
          重置
        </ElButton>
      </ElFormItem>
    </ElForm>
  </ElCard>
</template>

<script setup lang="ts">
  import { ElCard, ElForm, ElFormItem, ElInput, ElButton, ElSelect, ElOption } from 'element-plus'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { useDictStore } from '@/store/modules/dict'
  import { computed } from 'vue'

  defineOptions({ name: 'RulesSearch' })

  const dictStore = useDictStore()

  // 消息类型选项（从字典 store 获取）
  const msgTypeOptions = computed(() => {
    const dicts = dictStore.getDictByType('msg_type')
    return dicts.map((dict) => ({
      label: dict.dataLabel,
      value: dict.dataValue
    }))
  })

  const props = defineProps<{
    modelValue: {
      msgSource?: string
      msgType?: string
    }
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: typeof props.modelValue]
    search: [params: typeof props.modelValue]
    reset: []
  }>()

  const searchForm = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const handleSearch = () => {
    emit('search', { ...searchForm.value })
  }

  const handleReset = () => {
    searchForm.value = {
      msgSource: undefined,
      msgType: undefined
    }
    emit('reset')
  }
</script>

<style scoped lang="scss">
  .search-card {
    margin-bottom: 16px;
  }
</style>
