<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="rules"
    @reset="handleReset"
    @search="handleSearch"
  >
    <template #ownerId="{ modelValue }">
      <ElSelect
        :model-value="modelValue"
        @update:model-value="(val) => (formData.ownerId = val)"
        filterable
        remote
        reserve-keyword
        placeholder="搜索用户（账号/昵称/电话）"
        :remote-method="handleUserSearch"
        :loading="userSearchLoading"
        clearable
        class="w-full"
      >
        <ElOption
          v-for="user in userOptions"
          :key="user.id"
          :label="getUserDisplayName(user)"
          :value="user.id"
        >
          <div>
            <div>{{ user.nickName || user.userName }}</div>
            <div v-if="user.mobile" class="text-xs text-g-500">
              {{ user.mobile }}
            </div>
          </div>
        </ElOption>
      </ElSelect>
    </template>
  </ArtSearchBar>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted } from 'vue'
  import { fetchSearchUsers } from '@/api/image'

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

  // 用户搜索相关
  const userSearchLoading = ref(false)
  const userOptions = ref<Api.Image.UserSearchItem[]>([])

  // 标签选项
  const tagOptions = ref<string[]>(['风景', '人物', '建筑', '动物', '美食', '夜景', '日景'])

  // 地点选项（目前为空，后续从地址管理获取）
  const locationOptions = ref<string[]>([])

  // 表单数据双向绑定
  const searchBarRef = ref()
  const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  // 校验规则
  const rules = {}

  // 用户搜索
  const handleUserSearch = async (keyword: string) => {
    if (!keyword || keyword.trim() === '') {
      userOptions.value = []
      return
    }

    userSearchLoading.value = true
    try {
      const users = await fetchSearchUsers(keyword)
      userOptions.value = users
    } catch (error: any) {
      console.error('搜索用户失败:', error)
      userOptions.value = []
    } finally {
      userSearchLoading.value = false
    }
  }

  // 获取用户显示名称
  const getUserDisplayName = (user: Api.Image.UserSearchItem) => {
    return user.nickName || user.userName
  }

  // 初始化时加载标签选项（从已上传的图片中提取）
  onMounted(() => {
    // 可以在这里加载标签选项
  })

  // 表单配置
  const formItems = computed(() => [
    {
      label: '关键词',
      key: 'keyword',
      type: 'input',
      placeholder: '搜索图片名称或描述',
      clearable: true
    },
    {
      label: '所有者',
      key: 'ownerId',
      type: 'select'
    },
    {
      label: '标签',
      key: 'tags',
      type: 'select',
      props: {
        clearable: true,
        filterable: true,
        multiple: true,
        placeholder: '选择标签',
        options: tagOptions.value.map((tag) => ({ label: tag, value: tag }))
      }
    },
    {
      label: '地点',
      key: 'location',
      type: 'select',
      props: {
        clearable: true,
        filterable: true,
        placeholder: '选择地点',
        options: locationOptions.value.map((location) => ({ label: location, value: location }))
      }
    },
    {
      label: '上传时间',
      key: 'daterange',
      type: 'datetime',
      props: {
        style: { width: '100%' },
        placeholder: '请选择日期范围',
        type: 'daterange',
        rangeSeparator: '至',
        startPlaceholder: '开始日期',
        endPlaceholder: '结束日期',
        valueFormat: 'YYYY-MM-DD',
        shortcuts: [
          { text: '今日', value: [new Date(), new Date()] },
          { text: '最近一周', value: [new Date(Date.now() - 604800000), new Date()] },
          { text: '最近一个月', value: [new Date(Date.now() - 2592000000), new Date()] }
        ]
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
</script>
