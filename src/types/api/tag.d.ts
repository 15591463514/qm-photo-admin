/**
 * 标签管理类型定义
 *
 * 提供标签数据、标签组等类型
 */

declare namespace Api {
  namespace Tag {
    /** 标签数据 */
    interface TagData {
      id: number
      groupCode: string
      groupName: string
      groupStatus: number
      label: string
      value: string
      sort: number
      status: number
      description?: string | null
      createBy?: number | null
      createTime: string
      updateBy?: number | null
      updateTime?: string | null
    }

    /** 标签树形项（第一级是组，第二级是数据） */
    interface TagTreeItem {
      groupCode: string
      groupName: string
      groupStatus: number
      isGroup: boolean
      children: TagData[]
      tagCount?: number
      createTime?: string
    }

    /** 标签树形搜索参数 */
    interface TagTreeSearchParams {
      groupCode?: string
      groupName?: string
      groupStatus?: number
      label?: string
      value?: string
      status?: number
    }

    /** 标签项参数（用于批量创建） */
    interface TagItemParams {
      label: string
      value?: string
      sort?: number
      status?: number
      description?: string
    }

    /** 批量创建标签参数 */
    interface BatchCreateTagParams {
      groupCode: string
      groupName: string
      tags: TagItemParams[]
    }

    /** 创建标签参数（兼容旧接口，单个标签） */
    interface CreateTagParams {
      groupCode: string
      groupName: string
      label: string
      value?: string
      sort?: number
      status?: number
      description?: string
    }

    /** 更新标签参数 */
    interface UpdateTagParams {
      /** 标签组代码 */
      groupCode?: string
      /** 标签组名称 */
      groupName?: string
      /** 标签名称 */
      label?: string
      /** 标签值 */
      value?: string
      /** 排序 */
      sort?: number
      /** 状态 */
      status?: number
      /** 描述 */
      description?: string
    }

    /** 更新标签组参数 */
    interface UpdateTagGroupParams {
      /** 标签组代码 */
      groupCode?: string
      /** 标签组名称 */
      groupName?: string
      /** 标签组状态 */
      groupStatus?: number
      /** 描述 */
      description?: string
    }
  }
}
