/**
 * 字典管理类型定义
 *
 * 提供字典数据、字典类型等类型
 */

declare namespace Api {
  namespace SystemManage {
    /** 字典数据 */
    interface DictData {
      id: number
      typeCode: string
      typeName: string
      typeStatus: string
      dataLabel: string
      dataValue: string
      sortOrder: number
      status: string
      tagStyle?: string | null
      isDefault: boolean
      createBy?: number | null
      createTime: string
      updateBy?: number | null
      updateTime?: string | null
      remark?: string | null
    }

    /** 字典树形项（第一级是类型，第二级是数据） */
    interface DictTreeItem {
      typeCode: string
      typeName: string
      typeStatus: string
      isType: boolean
      children: DictData[]
      dataCount?: number
      createTime?: string
    }

    /** 字典树形搜索参数 */
    interface DictTreeSearchParams {
      typeCode?: string
      typeName?: string
      typeStatus?: string
      dataLabel?: string
      dataValue?: string
      status?: string
    }

    /** 创建字典参数 */
    interface CreateDictParams {
      typeCode: string
      typeName: string
      dataLabel: string
      dataValue: string
      sortOrder?: number
      status?: string
      tagStyle?: string
      isDefault?: boolean
      remark?: string
    }

    /** 更新字典参数 */
    interface UpdateDictParams {
      /** 字典类型编码 */
      typeCode?: string
      /** 字典类型名称 */
      typeName?: string
      /** 字典标签 */
      dataLabel?: string
      /** 字典值 */
      dataValue?: string
      /** 排序 */
      sortOrder?: number
      /** 状态 */
      status?: string
      /** 标签样式 */
      tagStyle?: string
      /** 是否默认值 */
      isDefault?: boolean
      /** 备注 */
      remark?: string
    }

    /** 更新字典类型参数 */
    interface UpdateDictTypeParams {
      /** 字典类型编码 */
      typeCode?: string
      /** 字典类型名称 */
      typeName?: string
      /** 字典类型状态 */
      typeStatus?: string
      /** 备注 */
      remark?: string
    }
  }
}
