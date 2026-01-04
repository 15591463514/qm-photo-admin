/**
 * API 接口类型定义模块
 *
 * 提供所有后端接口的类型定义
 *
 * ## 主要功能
 *
 * - 通用类型（分页参数、响应结构等）
 * - 认证类型（登录、用户信息等）
 * - 系统管理类型（用户、角色、字典、菜单等）
 * - 全局命名空间声明
 *
 * ## 使用场景
 *
 * - API 请求参数类型约束
 * - API 响应数据类型定义
 * - 接口文档类型同步
 *
 * ## 注意事项
 *
 * - 在 .vue 文件使用需要在 eslint.config.mjs 中配置 globals: { Api: 'readonly' }
 * - 使用全局命名空间，无需导入即可使用
 *
 * ## 使用方式
 *
 * ```typescript
 * const params: Api.Auth.LoginParams = { userName: 'admin', password: '123456' }
 * const response: Api.Auth.UserInfo = await fetchUserInfo()
 * ```
 *
 * ## 模块结构
 *
 * - `common.d.ts` - 通用类型（分页、状态等）
 * - `auth.d.ts` - 认证类型（登录、注册、用户信息）
 * - `user.d.ts` - 用户管理类型（用户列表、搜索、创建、更新）
 * - `role.d.ts` - 角色管理类型（角色列表、权限分配）
 * - `dict.d.ts` - 字典管理类型（字典数据、字典类型）
 * - `menu.d.ts` - 菜单管理类型（菜单数据、菜单按钮）
 *
 * @module types/api/api
 * @author Art Design Pro Team
 */

/// <reference path="./common.d.ts" />
/// <reference path="./auth.d.ts" />
/// <reference path="./user.d.ts" />
/// <reference path="./role.d.ts" />
/// <reference path="./dict.d.ts" />
/// <reference path="./menu.d.ts" />
/// <reference path="./notice.d.ts" />

declare namespace Api {
  // 所有类型定义都在各自的模块文件中
  // 这里只作为入口文件，通过 reference 引用各个模块
}
