/**
 * v-auth 权限指令
 *
 * 适用于后端权限控制模式，基于权限标识控制 DOM 元素的显示和隐藏。
 * 如果用户没有对应权限，元素将从 DOM 中移除。
 *
 * ## 主要功能
 *
 * - 权限验证 - 支持从用户 store 或路由 meta 中验证用户权限
 * - DOM 控制 - 无权限时自动移除元素，而非隐藏
 * - 响应式更新 - 权限变化时自动更新元素状态
 *
 * ## 使用示例
 *
 * ```vue
 * <!-- 只有拥有 'user:add' 权限的用户才能看到新增按钮 -->
 * <el-button v-auth="'user:add'">新增</el-button>
 *
 * <!-- 只有拥有 'user:edit' 权限的用户才能看到编辑按钮 -->
 * <el-button v-auth="'user:edit'">编辑</el-button>
 *
 * <!-- 只有拥有 'user:delete' 权限的用户才能看到删除按钮 -->
 * <el-button v-auth="'user:delete'">删除</el-button>
 * ```
 *
 * ## 注意事项
 *
 * - 该指令会直接移除 DOM 元素，而不是使用 v-if 隐藏
 * - 后端模式：从用户 store 的 buttons 列表中验证权限（格式：menuName:authMark）
 * - 前端模式：从当前路由的 meta.authList 中获取权限列表
 *
 * @module directives/auth
 * @author Art Design Pro Team
 */

import { router } from '@/router'
import { App, Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { useAppMode } from '@/hooks/core/useAppMode'

interface AuthBinding extends DirectiveBinding {
  value: string | string[]
}

/**
 * 检查按钮权限
 */
function checkAuthPermission(el: HTMLElement, binding: AuthBinding): void {
  const userStore = useUserStore()
  const { isFrontendMode } = useAppMode()

  // 获取权限标识（支持字符串或数组）
  const permissions = Array.isArray(binding.value) ? binding.value : [binding.value]

  let hasPermission = false

  if (isFrontendMode.value) {
    // 前端模式：从路由 meta.authList 中获取权限列表
    const authList = (router.currentRoute.value.meta.authList as Array<{ authMark: string }>) || []
    hasPermission = permissions.some((permission) =>
      authList.some((item) => item.authMark === permission)
    )
  } else {
    // 后端模式：从用户 store 的 buttons 列表中验证权限
    const userButtons = userStore.info?.buttons || []
    hasPermission = permissions.some((permission) => userButtons.includes(permission))
  }

  // 如果没有权限，移除元素
  if (!hasPermission) {
    removeElement(el)
  }
}

/**
 * 移除元素
 */
function removeElement(el: HTMLElement): void {
  if (el.parentNode) {
    el.parentNode.removeChild(el)
  }
}

/**
 * 权限指令
 */
const authDirective: Directive = {
  mounted: checkAuthPermission,
  updated: checkAuthPermission
}

/**
 * 设置权限指令
 */
export function setupAuthDirective(app: App): void {
  app.directive('auth', authDirective)
}
