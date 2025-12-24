/**
 * 菜单管理类型定义
 *
 * 提供菜单数据、菜单按钮等类型
 */

declare namespace Api {
  namespace SystemManage {
    /** 菜单按钮数据 */
    interface MenuButton {
      id?: number
      /** 菜单ID */
      menuId?: number
      /** 按钮名称 */
      title: string
      /** 权限标识 */
      authMark: string
      /** 排序 */
      sortOrder?: number
    }

    /** 菜单数据 */
    interface MenuData {
      id?: number
      parentId?: number
      name: string
      path: string
      component?: string
      title: string
      icon?: string
      isHide?: boolean
      isHideTab?: boolean
      link?: string
      isIframe?: boolean
      keepAlive?: boolean
      isFirstLevel?: boolean
      fixedTab?: boolean
      activePath?: string
      isFullPage?: boolean
      sortOrder?: number
      status?: string
      roles?: string[]
      buttons?: MenuButton[]
      children?: MenuData[]
    }

    /** 菜单搜索参数 */
    interface MenuSearchParams {
      title?: string
      path?: string
      status?: string
    }

    /** 创建菜单参数 */
    interface CreateMenuParams {
      /** 父菜单ID */
      parentId?: number
      /** 权限标识 */
      name?: string
      /** 路由路径 */
      path: string
      /** 组件路径 */
      component?: string
      /** 菜单名称 */
      title: string
      /** 图标 */
      icon?: string
      /** 是否隐藏菜单 */
      isHide?: boolean
      /** 是否隐藏标签 */
      isHideTab?: boolean
      /** 外部链接 */
      link?: string
      /** 是否为iframe */
      isIframe?: boolean
      /** 是否缓存 */
      keepAlive?: boolean
      /** 是否为一级菜单 */
      isFirstLevel?: boolean
      /** 是否固定标签 */
      fixedTab?: boolean
      /** 激活菜单路径 */
      activePath?: string
      /** 是否为全屏页面 */
      isFullPage?: boolean
      /** 排序 */
      sortOrder?: number
      /** 状态 */
      status?: string
      /** 角色权限 */
      roles?: string[]
      /** 菜单按钮 */
      buttons?: MenuButton[]
    }

    /** 更新菜单参数 */
    interface UpdateMenuParams {
      /** 父菜单ID */
      parentId?: number
      /** 权限标识 */
      name?: string
      /** 路由路径 */
      path?: string
      /** 组件路径 */
      component?: string
      /** 菜单名称 */
      title?: string
      /** 图标 */
      icon?: string
      /** 是否隐藏菜单 */
      isHide?: boolean
      /** 是否隐藏标签 */
      isHideTab?: boolean
      /** 外部链接 */
      link?: string
      /** 是否为iframe */
      isIframe?: boolean
      /** 是否缓存 */
      keepAlive?: boolean
      /** 是否为一级菜单 */
      isFirstLevel?: boolean
      /** 是否固定标签 */
      fixedTab?: boolean
      /** 激活菜单路径 */
      activePath?: string
      /** 是否为全屏页面 */
      isFullPage?: boolean
      /** 排序 */
      sortOrder?: number
      /** 状态 */
      status?: string
      /** 角色权限 */
      roles?: string[]
      /** 菜单按钮 */
      buttons?: MenuButton[]
    }
  }
}
