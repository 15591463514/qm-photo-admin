/**
 * 标签状态管理模块
 *
 * 提供标签数据的状态管理
 *
 * ## 主要功能
 *
 * - 标签数据存储和管理
 * - 按组代码快速查找标签数据
 * - 标签数据初始化加载
 * - 标签数据刷新
 *
 * ## 使用场景
 *
 * - 下拉选择框选项数据
 * - 标签显示
 * - 表单验证
 * - 数据展示
 *
 * ## 数据结构
 *
 * - tagMap: 按 groupCode 分组的标签数据映射
 * - tagList: 所有标签数据的扁平列表
 * - treeData: 树形结构的标签数据
 *
 * @module store/modules/tag
 * @author Art Design Pro Team
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchGetTagTree } from '@/api/tag'
import { ElMessage } from 'element-plus'
import { HttpError } from '@/utils/http/error'
import { ApiStatus } from '@/utils/http/status'

/**
 * 标签状态管理
 * 管理应用的标签数据，提供按组查找、初始化加载等功能
 */
export const useTagStore = defineStore(
  'tagStore',
  () => {
    /** 标签树形数据 */
    const treeData = ref<Api.Tag.TagTreeItem[]>([])
    /** 标签数据映射（按 groupCode 分组） */
    const tagMap = ref<Record<string, Api.Tag.TagData[]>>({})
    /** 所有标签数据的扁平列表 */
    const tagList = ref<Api.Tag.TagData[]>([])

    /**
     * 根据标签组代码获取标签数据
     * @param groupCode 标签组代码
     * @param status 状态筛选（可选，1-启用，0-禁用）
     * @returns 标签数据列表
     */
    const getTagsByGroup = (groupCode: string, status?: number): Api.Tag.TagData[] => {
      const tags = tagMap.value[groupCode] || []
      if (status !== undefined) {
        return tags.filter((tag) => tag.status === status)
      }
      return tags
    }

    /**
     * 根据标签组代码和值获取标签名称
     * @param groupCode 标签组代码
     * @param value 标签值
     * @returns 标签名称，如果未找到返回空字符串
     */
    const getTagLabel = (groupCode: string, value: string): string => {
      const tags = tagMap.value[groupCode] || []
      const tag = tags.find((t) => t.value === value)
      return tag?.label || ''
    }

    /**
     * 根据标签组代码和值获取标签数据
     * @param groupCode 标签组代码
     * @param value 标签值
     * @returns 标签数据，如果未找到返回 undefined
     */
    const getTagData = (groupCode: string, value: string): Api.Tag.TagData | undefined => {
      const tags = tagMap.value[groupCode] || []
      return tags.find((t) => t.value === value)
    }

    /**
     * 初始化标签数据
     * 从服务器获取所有标签数据并存储到 store 中
     * 只存储启用的标签组和启用的标签数据
     * 如果用户没有权限（403），则静默失败，不显示错误消息
     */
    const initTagData = async () => {
      try {
        const data = await fetchGetTagTree({})
        treeData.value = data

        // 构建标签映射和列表（只包含启用的数据）
        const map: Record<string, Api.Tag.TagData[]> = {}
        const list: Api.Tag.TagData[] = []

        data.forEach((treeItem) => {
          // 只处理组状态为启用的标签组
          if (treeItem.groupStatus === 1 && treeItem.children && treeItem.children.length > 0) {
            // 过滤掉状态为禁用的标签数据
            const enabledChildren = treeItem.children.filter((child) => child.status === 1)

            // 只有当有启用的子数据时才添加到映射中
            if (enabledChildren.length > 0) {
              map[treeItem.groupCode] = enabledChildren
              list.push(...enabledChildren)
            }
          }
        })

        tagMap.value = map
        tagList.value = list
      } catch (error) {
        // 如果是403权限错误，静默失败，不显示错误消息（用户可能没有标签查看权限）
        if (error instanceof HttpError && error.code === ApiStatus.forbidden) {
          console.warn('用户没有标签查看权限，跳过标签数据加载')
          return
        }
        // 其他错误才显示错误消息
        console.error('初始化标签数据失败:', error)
        ElMessage.error('加载标签数据失败')
      }
    }

    /**
     * 刷新标签数据
     * 重新从服务器获取标签数据
     */
    const refreshTagData = async () => {
      await initTagData()
    }

    /**
     * 清空标签数据
     */
    const clearTagData = () => {
      treeData.value = []
      tagMap.value = {}
      tagList.value = []
    }

    return {
      treeData,
      tagMap,
      tagList,
      getTagsByGroup,
      getTagLabel,
      getTagData,
      initTagData,
      refreshTagData,
      clearTagData
    }
  },
  {
    persist: {
      key: 'tag',
      storage: localStorage
    }
  }
)
