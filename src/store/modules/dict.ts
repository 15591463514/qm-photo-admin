/**
 * 字典状态管理模块
 *
 * 提供字典数据的状态管理
 *
 * ## 主要功能
 *
 * - 字典数据存储和管理
 * - 按类型编码快速查找字典数据
 * - 字典数据初始化加载
 * - 字典数据刷新
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
 * - dictMap: 按 typeCode 分组的字典数据映射
 * - dictList: 所有字典数据的扁平列表
 * - treeData: 树形结构的字典数据
 *
 * @module store/modules/dict
 * @author Art Design Pro Team
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchGetDictTree } from '@/api/dict'
import { ElMessage } from 'element-plus'
import { EnableStatus } from '@/constants/enums'
import { HttpError } from '@/utils/http/error'
import { ApiStatus } from '@/utils/http/status'

/**
 * 字典状态管理
 * 管理应用的字典数据，提供按类型查找、初始化加载等功能
 */
export const useDictStore = defineStore(
  'dictStore',
  () => {
    /** 字典树形数据 */
    const treeData = ref<Api.SystemManage.DictTreeItem[]>([])
    /** 字典数据映射（按 typeCode 分组） */
    const dictMap = ref<Record<string, Api.SystemManage.DictData[]>>({})
    /** 所有字典数据的扁平列表 */
    const dictList = ref<Api.SystemManage.DictData[]>([])

    /**
     * 根据字典类型编码获取字典数据
     * @param typeCode 字典类型编码
     * @param status 状态筛选（可选，'1'-启用，'2'-禁用）
     * @returns 字典数据列表
     */
    const getDictByType = (typeCode: string, status?: string): Api.SystemManage.DictData[] => {
      const dicts = dictMap.value[typeCode] || []
      if (status) {
        return dicts.filter((dict) => dict.status === status)
      }
      return dicts
    }

    /**
     * 根据字典类型编码和值获取字典标签
     * @param typeCode 字典类型编码
     * @param dataValue 字典值
     * @returns 字典标签，如果未找到返回空字符串
     */
    const getDictLabel = (typeCode: string, dataValue: string): string => {
      const dicts = dictMap.value[typeCode] || []
      const dict = dicts.find((d) => d.dataValue === dataValue)
      return dict?.dataLabel || ''
    }

    /**
     * 根据字典类型编码和值获取字典数据
     * @param typeCode 字典类型编码
     * @param dataValue 字典值
     * @returns 字典数据，如果未找到返回 undefined
     */
    const getDictData = (
      typeCode: string,
      dataValue: string
    ): Api.SystemManage.DictData | undefined => {
      const dicts = dictMap.value[typeCode] || []
      return dicts.find((d) => d.dataValue === dataValue)
    }

    /**
     * 初始化字典数据
     * 从服务器获取所有字典数据并存储到 store 中
     * 只存储启用的字典类型和启用的字典数据
     * 如果用户没有权限（403），则静默失败，不显示错误消息
     */
    const initDictData = async () => {
      try {
        const data = await fetchGetDictTree({})
        treeData.value = data

        // 构建字典映射和列表（只包含启用的数据）
        const map: Record<string, Api.SystemManage.DictData[]> = {}
        const list: Api.SystemManage.DictData[] = []

        data.forEach((treeItem) => {
          // 只处理类型状态为启用的字典类型
          if (
            treeItem.typeStatus === EnableStatus.ENABLED &&
            treeItem.children &&
            treeItem.children.length > 0
          ) {
            // 过滤掉状态为禁用的字典数据
            const enabledChildren = treeItem.children.filter(
              (child) => child.status === EnableStatus.ENABLED
            )

            // 只有当有启用的子数据时才添加到映射中
            if (enabledChildren.length > 0) {
              map[treeItem.typeCode] = enabledChildren
              list.push(...enabledChildren)
            }
          }
        })

        dictMap.value = map
        dictList.value = list
      } catch (error) {
        // 如果是403权限错误，静默失败，不显示错误消息（用户可能没有字典查看权限）
        if (error instanceof HttpError && error.code === ApiStatus.forbidden) {
          console.warn('用户没有字典查看权限，跳过字典数据加载')
          return
        }
        // 其他错误才显示错误消息
        console.error('初始化字典数据失败:', error)
        ElMessage.error('加载字典数据失败')
      }
    }

    /**
     * 刷新字典数据
     * 重新从服务器获取字典数据
     */
    const refreshDictData = async () => {
      await initDictData()
    }

    /**
     * 清空字典数据
     */
    const clearDictData = () => {
      treeData.value = []
      dictMap.value = {}
      dictList.value = []
    }

    return {
      treeData,
      dictMap,
      dictList,
      getDictByType,
      getDictLabel,
      getDictData,
      initDictData,
      refreshDictData,
      clearDictData
    }
  },
  {
    persist: {
      key: 'dict',
      storage: localStorage
    }
  }
)
