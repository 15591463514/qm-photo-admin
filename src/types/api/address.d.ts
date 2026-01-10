/**
 * 地址管理相关类型定义
 */
declare namespace Api {
  namespace Address {
    /**
     * 地址信息
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
      province?: string
      /** 市 */
      city?: string
      /** 区/县 */
      district?: string
      /** 行政区划代码 */
      adcode?: string
      /** 描述 */
      description?: string
      /** 状态：1-启用，0-禁用 */
      status: number
      /** 创建者ID */
      creatorId?: number
      /** 更新者ID */
      updaterId?: number
      /** 创建时间 */
      createdAt: string
      /** 更新时间 */
      updatedAt: string
    }

    /**
     * 地址列表响应
     */
    interface AddressList {
      list: AddressItem[]
      total: number
    }

    /**
     * 地址列表查询参数
     */
    interface AddressListParams {
      /** 页码 */
      page?: number
      /** 每页数量 */
      pageSize?: number
      /** 搜索关键词 */
      keyword?: string
      /** 省 */
      province?: string
      /** 市 */
      city?: string
      /** 区/县 */
      district?: string
      /** 状态 */
      status?: number
    }

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
