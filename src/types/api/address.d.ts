/**
 * 地址管理相关类型定义
 */

/// <reference path="./common.d.ts" />

declare namespace Api {
  namespace Address {
    /**
     * 地址信息（与后端返回格式一致）
     */
    interface AddressItem {
      id: number
      /** 地址名称 */
      name: string
      /** 详细地址 */
      detail: string
      /** 经度 */
      longitude: number
      /** 纬度 */
      latitude: number
      /** 省 */
      province?: string | null
      /** 市 */
      city?: string | null
      /** 区/县 */
      district?: string | null
      /** 行政区划代码 */
      adcode?: string | null
      /** 描述 */
      description?: string | null
      /** 状态：1-启用，0-禁用 */
      status: number
      /** 创建者ID */
      createBy?: number | null
      /** 创建时间 */
      createTime: string
      /** 更新者ID */
      updateBy?: number | null
      /** 更新时间 */
      updateTime?: string | null
    }

    /**
     * 地址列表响应（使用标准分页格式）
     */
    type AddressList = Api.Common.PaginatedResponse<AddressItem>

    /**
     * 地址列表查询参数
     */
    type AddressListParams = Partial<
      Pick<AddressItem, 'province' | 'city' | 'district' | 'status'> & {
        keyword?: string
      } & Api.Common.CommonSearchParams
    >

    /**
     * 创建地址参数
     */
    interface CreateAddressParams {
      /** 地址名称 */
      name: string
      /** 详细地址 */
      detail: string
      /** 经度 */
      longitude: number
      /** 纬度 */
      latitude: number
      /** 省 */
      province?: string
      /** 市 */
      city?: string
      /** 区/县 */
      district?: string
      /** 行政区划代码 */
      adcode?: string
      /** 描述 */
      description?: string
      /** 状态 */
      status?: number
    }

    /**
     * 更新地址参数
     */
    interface UpdateAddressParams extends CreateAddressParams {
      /** 地址ID */
      id: number
    }
  }
}
