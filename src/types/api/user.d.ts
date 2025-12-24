/**
 * 用户管理类型定义
 *
 * 提供用户列表、搜索、创建、更新等类型
 */

/// <reference path="./common.d.ts" />

declare namespace Api {
  namespace SystemManage {
    /** 用户列表 */
    type UserList = Api.Common.PaginatedResponse<UserListItem>

    /** 用户列表项 */
    interface UserListItem {
      id: number
      avatar: string
      status: string
      userName: string
      userGender: string
      nickName: string
      userPhone: string
      userEmail: string
      userRoles: string[]
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    /** 用户搜索参数 */
    type UserSearchParams = Partial<
      Pick<UserListItem, 'id' | 'userName' | 'userGender' | 'userPhone' | 'userEmail' | 'status'> &
        Api.Common.CommonSearchParams
    >

    /** 创建用户参数 */
    interface CreateUserParams {
      userName: string
      password: string
      nickName?: string
      email?: string
      avatar?: string
      userPhone?: string
      userGender?: string
      status?: string
      remark?: string
      roleCodes?: string[]
    }

    /** 更新用户参数 */
    interface UpdateUserParams {
      password?: string
      nickName?: string
      email?: string
      avatar?: string
      userPhone?: string
      userGender?: string
      status?: string
      remark?: string
      roleCodes?: string[]
    }
  }
}
