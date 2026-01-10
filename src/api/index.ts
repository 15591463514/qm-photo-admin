/**
 * API 模块统一导出
 *
 * 按模块组织 API 请求函数，便于维护和管理
 *
 * ## 模块结构
 *
 * - `auth.ts` - 认证相关（登录、注册、刷新Token、获取用户信息、获取用户菜单）
 * - `user.ts` - 用户管理（用户列表、创建、更新、删除、修改密码）
 * - `role.ts` - 角色管理（角色列表、详情、创建、更新、删除、权限分配）
 * - `menu.ts` - 菜单管理（菜单树、详情、创建、更新、删除、按钮管理）
 * - `dict.ts` - 字典管理（字典树、字典数据、创建、更新、删除）
 *
 * ## 使用方式
 *
 * ```typescript
 * import { fetchLogin } from '@/api/auth'
 * import { fetchGetUserList } from '@/api/user'
 * import { fetchGetRoleList } from '@/api/role'
 * ```
 */

// 认证相关
export * from './auth'

// 用户管理
export * from './user'

// 角色管理
export * from './role'

// 菜单管理
export * from './menu'

// 字典管理
export * from './dict'

// 图片管理
export * from './image'

// 地址管理
export * from './address'
