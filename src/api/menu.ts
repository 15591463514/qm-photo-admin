import request from '@/utils/http'

/**
 * 获取菜单树形结构
 * @param params 搜索参数
 * @returns 菜单树
 */
export function fetchGetMenuTree(params?: Api.SystemManage.MenuSearchParams) {
  return request.get<Api.SystemManage.MenuData[]>({
    url: '/api/menu/tree',
    params
  })
}

/**
 * 获取菜单详情
 * @param id 菜单ID
 * @returns 菜单详情
 */
export function fetchGetMenuDetail(id: number) {
  return request.get<Api.SystemManage.MenuData>({
    url: `/api/menu/${id}`
  })
}

/**
 * 创建菜单
 * @param params 创建菜单参数
 * @returns 创建的菜单信息
 */
export function fetchCreateMenu(params: Api.SystemManage.CreateMenuParams) {
  return request.post<Api.SystemManage.MenuData>({
    url: '/api/menu',
    params,
    showErrorMessage: false // 禁用自动错误提示，由组件统一处理
  })
}

/**
 * 更新菜单
 * @param id 菜单ID
 * @param params 更新菜单参数
 * @returns 更新后的菜单信息
 */
export function fetchUpdateMenu(id: number, params: Api.SystemManage.UpdateMenuParams) {
  return request.put<Api.SystemManage.MenuData>({
    url: `/api/menu/${id}`,
    params,
    showErrorMessage: false // 禁用自动错误提示，由组件统一处理
  })
}

/**
 * 删除菜单
 * @param id 菜单ID
 * @returns 删除的菜单信息
 */
export function fetchDeleteMenu(id: number) {
  return request.del<Api.SystemManage.MenuData>({
    url: `/api/menu/${id}`,
    showErrorMessage: false // 禁用自动错误提示，由组件统一处理
  })
}

/**
 * 创建菜单按钮
 * @param menuId 菜单ID
 * @param params 按钮参数
 * @returns 创建的按钮信息
 */
export function fetchCreateMenuButton(
  menuId: number,
  params: {
    title: string
    authMark: string
    sortOrder?: number
  }
) {
  return request.post<{
    id: number
    menuId: number
    title: string
    authMark: string
    sortOrder: number
  }>({
    url: `/api/menu/${menuId}/button`,
    params,
    showErrorMessage: false // 禁用自动错误提示，由组件统一处理
  })
}

/**
 * 更新菜单按钮
 * @param menuId 菜单ID
 * @param buttonId 按钮ID
 * @param params 按钮参数
 * @returns 更新后的按钮信息
 */
export function fetchUpdateMenuButton(
  menuId: number,
  buttonId: number,
  params: {
    title?: string
    authMark?: string
    sortOrder?: number
  }
) {
  return request.put<{
    id: number
    menuId: number
    title: string
    authMark: string
    sortOrder: number
  }>({
    url: `/api/menu/${menuId}/button/${buttonId}`,
    params,
    showErrorMessage: false // 禁用自动错误提示，由组件统一处理
  })
}

/**
 * 删除菜单按钮
 * @param menuId 菜单ID
 * @param buttonId 按钮ID
 * @returns 删除的按钮信息
 */
export function fetchDeleteMenuButton(menuId: number, buttonId: number) {
  return request.del<{
    id: number
    menuId: number
    title: string
    authMark: string
  }>({
    url: `/api/menu/${menuId}/button/${buttonId}`,
    showErrorMessage: false // 禁用自动错误提示，由组件统一处理
  })
}
