import { defineStore } from 'pinia'

/**
 * 资源管理 Store
 * 用于存储资源上传页面的视图模式等状态
 */
export const useSourceStore = defineStore(
  'source',
  () => {
    // 视图模式：large-大图, small-小图, table-表格
    const viewMode = ref<'large' | 'small' | 'table'>('large')

    /**
     * 设置视图模式
     */
    const setViewMode = (mode: 'large' | 'small' | 'table') => {
      viewMode.value = mode
    }

    return {
      viewMode,
      setViewMode
    }
  },
  {
    persist: {
      key: 'source',
      storage: localStorage
    }
  }
)
