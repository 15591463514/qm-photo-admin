import type { Api } from '@/types/api/address.d'

/**
 * Mock 地址数据
 */
const mockAddresses: Api.Address.AddressItem[] = [
  {
    id: 1,
    name: '公司总部',
    detail: '北京市朝阳区建国路88号SOHO现代城A座',
    longitude: 116.481488,
    latitude: 39.90923,
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    adcode: '110105',
    description: '公司主要办公地点',
    status: 1,
    creatorId: 1,
    updaterId: 1,
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    name: '天安门广场',
    detail: '北京市东城区东长安街',
    longitude: 116.397128,
    latitude: 39.903738,
    province: '北京市',
    city: '北京市',
    district: '东城区',
    adcode: '110101',
    description: '著名旅游景点',
    status: 1,
    creatorId: 1,
    updaterId: 1,
    createdAt: '2024-01-02 14:30:00',
    updatedAt: '2024-01-02 14:30:00'
  },
  {
    id: 3,
    name: '上海外滩',
    detail: '上海市黄浦区中山东一路',
    longitude: 121.490317,
    latitude: 31.239663,
    province: '上海市',
    city: '上海市',
    district: '黄浦区',
    adcode: '310101',
    description: '上海标志性景点',
    status: 1,
    creatorId: 1,
    updaterId: 1,
    createdAt: '2024-01-03 09:15:00',
    updatedAt: '2024-01-03 09:15:00'
  },
  {
    id: 4,
    name: '杭州西湖',
    detail: '浙江省杭州市西湖区',
    longitude: 120.135307,
    latitude: 30.274084,
    province: '浙江省',
    city: '杭州市',
    district: '西湖区',
    adcode: '330106',
    description: '世界文化遗产',
    status: 1,
    creatorId: 1,
    updaterId: 1,
    createdAt: '2024-01-04 16:20:00',
    updatedAt: '2024-01-04 16:20:00'
  },
  {
    id: 5,
    name: '深圳科技园',
    detail: '广东省深圳市南山区科技园',
    longitude: 113.952847,
    latitude: 22.540503,
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    adcode: '440305',
    description: '高新技术产业园区',
    status: 1,
    creatorId: 1,
    updaterId: 1,
    createdAt: '2024-01-05 11:45:00',
    updatedAt: '2024-01-05 11:45:00'
  },
  {
    id: 6,
    name: '成都宽窄巷子',
    detail: '四川省成都市青羊区宽窄巷子',
    longitude: 104.062827,
    latitude: 30.669083,
    province: '四川省',
    city: '成都市',
    district: '青羊区',
    adcode: '510105',
    description: '成都历史文化街区',
    status: 1,
    creatorId: 1,
    updaterId: 1,
    createdAt: '2024-01-06 13:30:00',
    updatedAt: '2024-01-06 13:30:00'
  },
  {
    id: 7,
    name: '西安大雁塔',
    detail: '陕西省西安市雁塔区大雁塔',
    longitude: 108.964766,
    latitude: 34.218372,
    province: '陕西省',
    city: '西安市',
    district: '雁塔区',
    adcode: '610113',
    description: '世界文化遗产',
    status: 1,
    creatorId: 1,
    updaterId: 1,
    createdAt: '2024-01-07 10:00:00',
    updatedAt: '2024-01-07 10:00:00'
  },
  {
    id: 8,
    name: '广州塔',
    detail: '广东省广州市海珠区阅江西路222号',
    longitude: 113.32452,
    latitude: 23.106414,
    province: '广东省',
    city: '广州市',
    district: '海珠区',
    adcode: '440105',
    description: '广州地标建筑',
    status: 0,
    creatorId: 1,
    updaterId: 1,
    createdAt: '2024-01-08 15:20:00',
    updatedAt: '2024-01-08 15:20:00'
  }
]

/**
 * Mock 获取地址列表
 */
export function mockGetAddressList(
  params: Api.Address.AddressListParams
): Promise<Api.Address.AddressList> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredList = [...mockAddresses]

      // 关键词搜索
      if (params.keyword) {
        const keyword = params.keyword.toLowerCase()
        filteredList = filteredList.filter(
          (item) =>
            item.name.toLowerCase().includes(keyword) ||
            item.detail.toLowerCase().includes(keyword) ||
            item.province?.toLowerCase().includes(keyword) ||
            item.city?.toLowerCase().includes(keyword) ||
            item.district?.toLowerCase().includes(keyword)
        )
      }

      // 省筛选
      if (params.province) {
        filteredList = filteredList.filter((item) => item.province === params.province)
      }

      // 市筛选
      if (params.city) {
        filteredList = filteredList.filter((item) => item.city === params.city)
      }

      // 区筛选
      if (params.district) {
        filteredList = filteredList.filter((item) => item.district === params.district)
      }

      // 状态筛选
      if (params.status !== undefined) {
        filteredList = filteredList.filter((item) => item.status === params.status)
      }

      // 分页
      const page = params.page || 1
      const pageSize = params.pageSize || 10
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const paginatedList = filteredList.slice(start, end)

      resolve({
        list: paginatedList,
        total: filteredList.length
      })
    }, 300)
  })
}

/**
 * Mock 获取地址详情
 */
export function mockGetAddressDetail(id: number): Promise<Api.Address.AddressItem> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const address = mockAddresses.find((item) => item.id === id)
      if (address) {
        resolve(address)
      } else {
        reject(new Error('地址不存在'))
      }
    }, 200)
  })
}

/**
 * Mock 创建地址
 */
export function mockCreateAddress(
  params: Api.Address.CreateAddressParams
): Promise<Api.Address.AddressItem> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newAddress: Api.Address.AddressItem = {
        id: mockAddresses.length + 1,
        ...params,
        status: params.status ?? 1,
        creatorId: 1,
        updaterId: 1,
        createdAt: new Date()
          .toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          })
          .replace(/\//g, '-'),
        updatedAt: new Date()
          .toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          })
          .replace(/\//g, '-')
      }
      mockAddresses.unshift(newAddress)
      resolve(newAddress)
    }, 300)
  })
}

/**
 * Mock 更新地址
 */
export function mockUpdateAddress(
  params: Api.Address.UpdateAddressParams
): Promise<Api.Address.AddressItem> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockAddresses.findIndex((item) => item.id === params.id)
      if (index !== -1) {
        const updatedAddress: Api.Address.AddressItem = {
          ...mockAddresses[index],
          ...params,
          updaterId: 1,
          updatedAt: new Date()
            .toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            })
            .replace(/\//g, '-')
        }
        mockAddresses[index] = updatedAddress
        resolve(updatedAddress)
      } else {
        reject(new Error('地址不存在'))
      }
    }, 300)
  })
}

/**
 * Mock 删除地址
 */
export function mockDeleteAddress(id: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockAddresses.findIndex((item) => item.id === id)
      if (index !== -1) {
        mockAddresses.splice(index, 1)
        resolve()
      } else {
        reject(new Error('地址不存在'))
      }
    }, 300)
  })
}

/**
 * Mock 批量删除地址
 */
export function mockBatchDeleteAddress(ids: number[]): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      ids.forEach((id) => {
        const index = mockAddresses.findIndex((item) => item.id === id)
        if (index !== -1) {
          mockAddresses.splice(index, 1)
        }
      })
      resolve()
    }, 300)
  })
}
