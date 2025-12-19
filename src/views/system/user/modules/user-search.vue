<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="rules"
    @reset="handleReset"
    @search="handleSearch"
  >
  </ArtSearchBar>
</template>

<script setup lang="ts">
  import { useDictStore } from '@/store/modules/dict'
  import { DICT_TYPE_CODE } from '@/constants/dict'
  import { computed, ref, onMounted } from 'vue'
  import { fetchGetRoleList } from '@/api/system-manage'
  import { ElMessage } from 'element-plus'

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

  // 字典 store
  const dictStore = useDictStore()

  // 角色列表
  const roleList = ref<Api.SystemManage.RoleListItem[]>([])
  const roleLoading = ref(false)

  // 性别选项（从字典 store 获取）
  const genderOptions = computed(() => {
    const dicts = dictStore.getDictByType(DICT_TYPE_CODE.USER_GENDER)
    return dicts.map((dict) => ({
      label: dict.dataLabel,
      value: dict.dataValue
    }))
  })

  // 角色选项
  const roleOptions = computed(() => {
    return roleList.value.map((role) => ({
      label: role.roleName,
      value: role.roleId
    }))
  })

  // 表单数据双向绑定
  const searchBarRef = ref()
  const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  // 校验规则
  const rules = {}

  // 动态 options
  const statusOptions = ref<{ label: string; value: string; disabled?: boolean }[]>([])

  // 模拟接口返回状态数据
  function fetchStatusOptions(): Promise<typeof statusOptions.value> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { label: '在线', value: '1' },
          { label: '离线', value: '2' },
          { label: '异常', value: '3' },
          { label: '注销', value: '4' }
        ])
      }, 1000)
    })
  }

  /**
   * 获取角色列表
   */
  const fetchRoleList = async () => {
    try {
      roleLoading.value = true
      const response = await fetchGetRoleList({})
      if (Array.isArray(response)) {
        roleList.value = response
      }
    } catch (error) {
      console.error('获取角色列表失败:', error)
      ElMessage.error('获取角色列表失败')
    } finally {
      roleLoading.value = false
    }
  }

  onMounted(async () => {
    statusOptions.value = await fetchStatusOptions()
    await fetchRoleList()
  })

  // 表单配置（顺序：名称、角色、状态、性别、注册日期）
  const formItems = computed(() => [
    {
      label: '名称',
      key: 'name',
      type: 'input',
      placeholder: '请输入用户名/昵称',
      clearable: true
    },
    {
      label: '角色',
      key: 'roleId',
      type: 'select',
      props: {
        clearable: true,
        filterable: true,
        placeholder: '请选择角色',
        options: roleOptions.value,
        loading: roleLoading.value
      }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        clearable: true,
        filterable: true,
        placeholder: '请选择状态',
        options: statusOptions.value
      }
    },
    {
      label: '性别',
      key: 'userGender',
      type: 'select',
      props: {
        clearable: true,
        filterable: true,
        placeholder: '请选择性别',
        options: genderOptions.value
      }
    },
    {
      label: '注册日期',
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
    console.log('重置表单')
    emit('reset')
  }

  async function handleSearch() {
    await searchBarRef.value.validate()
    emit('search', formData.value)
    console.log('表单数据', formData.value)
  }
</script>
