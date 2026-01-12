/**
 * 模拟相册数据
 */
export const mockAlbums: Api.Album.AlbumItem[] = [
  {
    id: 1,
    name: '自然风光',
    coverImage: 'https://picsum.photos/400/300?random=1',
    views: 1250,
    addressId: 1,
    addressName: '公司总部',
    description: '记录美丽的自然风景',
    status: 1,
    tags: [
      { id: 1, label: '风景', value: 'landscape' },
      { id: 2, label: '自然', value: 'nature' },
      { id: 3, label: '户外', value: 'outdoor' }
    ],
    imageCount: 45,
    createBy: 1,
    createTime: '2024-01-15 10:30:00',
    updateBy: 1,
    updateTime: '2024-01-20 15:20:00'
  },
  {
    id: 2,
    name: '城市建筑',
    coverImage: 'https://picsum.photos/400/300?random=2',
    views: 890,
    addressId: 2,
    addressName: '上海分公司',
    description: '现代城市建筑摄影',
    status: 1,
    tags: [
      { id: 4, label: '建筑', value: 'architecture' },
      { id: 5, label: '城市', value: 'city' }
    ],
    imageCount: 32,
    createBy: 1,
    createTime: '2024-01-16 11:00:00',
    updateBy: 1,
    updateTime: '2024-01-18 09:15:00'
  },
  {
    id: 3,
    name: '人物肖像',
    coverImage: 'https://picsum.photos/400/300?random=3',
    views: 567,
    addressId: null,
    addressName: null,
    description: '人物摄影作品集',
    status: 1,
    tags: [
      { id: 6, label: '人物', value: 'portrait' },
      { id: 7, label: '艺术', value: 'art' }
    ],
    imageCount: 28,
    createBy: 2,
    createTime: '2024-01-17 14:20:00',
    updateBy: 2,
    updateTime: '2024-01-19 16:30:00'
  },
  {
    id: 4,
    name: '美食记录',
    coverImage: 'https://picsum.photos/400/300?random=4',
    views: 1234,
    addressId: 3,
    addressName: '深圳分公司',
    description: '各种美食摄影',
    status: 1,
    tags: [
      { id: 8, label: '美食', value: 'food' },
      { id: 9, label: '生活', value: 'life' }
    ],
    imageCount: 56,
    createBy: 1,
    createTime: '2024-01-18 09:00:00',
    updateBy: 1,
    updateTime: '2024-01-22 10:45:00'
  },
  {
    id: 5,
    name: '旅行日记',
    coverImage: 'https://picsum.photos/400/300?random=5',
    views: 2100,
    addressId: 1,
    addressName: '公司总部',
    description: '旅行途中的精彩瞬间',
    status: 1,
    tags: [
      { id: 1, label: '风景', value: 'landscape' },
      { id: 10, label: '旅行', value: 'travel' },
      { id: 11, label: '记录', value: 'record' }
    ],
    imageCount: 78,
    createBy: 2,
    createTime: '2024-01-19 15:30:00',
    updateBy: 2,
    updateTime: '2024-01-25 11:20:00'
  },
  {
    id: 6,
    name: '动物世界',
    coverImage: 'https://picsum.photos/400/300?random=6',
    views: 456,
    addressId: null,
    addressName: null,
    description: '可爱的动物们',
    status: 0,
    tags: [{ id: 12, label: '动物', value: 'animal' }],
    imageCount: 15,
    createBy: 1,
    createTime: '2024-01-20 10:00:00',
    updateBy: 1,
    updateTime: '2024-01-21 14:00:00'
  }
]

/**
 * 模拟获取相册列表
 */
export function mockGetAlbumList(
  params: Api.Album.AlbumListParams = {}
): Promise<Api.Album.AlbumList> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { current = 1, size = 10, keyword, addressId, tagId, status } = params

      let filteredList = [...mockAlbums]

      // 按关键词搜索
      if (keyword) {
        const lowerKeyword = keyword.toLowerCase()
        filteredList = filteredList.filter(
          (item) =>
            item.name.toLowerCase().includes(lowerKeyword) ||
            item.description?.toLowerCase().includes(lowerKeyword) ||
            item.addressName?.toLowerCase().includes(lowerKeyword)
        )
      }

      // 按地址过滤
      if (addressId !== undefined) {
        filteredList = filteredList.filter((item) => item.addressId === addressId)
      }

      // 按标签过滤
      if (tagId !== undefined) {
        filteredList = filteredList.filter((item) => item.tags.some((tag) => tag.id === tagId))
      }

      // 按状态过滤
      if (status !== undefined) {
        filteredList = filteredList.filter((item) => item.status === status)
      }

      // 分页
      const start = (current - 1) * size
      const end = start + size
      const paginatedList = filteredList.slice(start, end)

      resolve({
        records: paginatedList,
        total: filteredList.length,
        current,
        size
      })
    }, 300)
  })
}

/**
 * 模拟获取相册详情
 */
export function mockGetAlbumDetail(id: number): Promise<Api.Album.AlbumItem> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const album = mockAlbums.find((a) => a.id === id)
      if (album) {
        resolve(album)
      } else {
        reject(new Error('相册不存在'))
      }
    }, 200)
  })
}

/**
 * 模拟创建相册
 */
export function mockCreateAlbum(params: Api.Album.CreateAlbumParams): Promise<Api.Album.AlbumItem> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newId = Math.max(...mockAlbums.map((a) => a.id)) + 1
      const newAlbum: Api.Album.AlbumItem = {
        id: newId,
        name: params.name,
        coverImage: params.coverImage || null,
        views: 0,
        addressId: params.addressId || null,
        addressName: params.addressId ? '公司总部' : null,
        description: params.description || null,
        status: params.status ?? 1,
        tags: params.tagIds
          ? params.tagIds.map((tagId) => ({
              id: tagId,
              label: `标签${tagId}`,
              value: `tag_${tagId}`
            }))
          : [],
        imageCount: 0,
        createBy: 1,
        createTime: new Date()
          .toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
          .replace(/\//g, '-'),
        updateBy: null,
        updateTime: null
      }
      mockAlbums.unshift(newAlbum)
      resolve(newAlbum)
    }, 500)
  })
}

/**
 * 模拟更新相册
 */
export function mockUpdateAlbum(params: Api.Album.UpdateAlbumParams): Promise<Api.Album.AlbumItem> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockAlbums.findIndex((a) => a.id === params.id)
      if (index === -1) {
        reject(new Error('相册不存在'))
        return
      }

      const existingAlbum = mockAlbums[index]
      const updatedAlbum: Api.Album.AlbumItem = {
        ...existingAlbum,
        name: params.name ?? existingAlbum.name,
        coverImage: params.coverImage !== undefined ? params.coverImage : existingAlbum.coverImage,
        addressId: params.addressId !== undefined ? params.addressId : existingAlbum.addressId,
        addressName:
          params.addressId !== undefined
            ? params.addressId
              ? '公司总部'
              : null
            : existingAlbum.addressName,
        description:
          params.description !== undefined ? params.description : existingAlbum.description,
        status: params.status !== undefined ? params.status : existingAlbum.status,
        tags: params.tagIds
          ? params.tagIds.map((tagId) => ({
              id: tagId,
              label: `标签${tagId}`,
              value: `tag_${tagId}`
            }))
          : existingAlbum.tags,
        updateBy: 1,
        updateTime: new Date()
          .toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
          .replace(/\//g, '-')
      }

      mockAlbums[index] = updatedAlbum
      resolve(updatedAlbum)
    }, 500)
  })
}

/**
 * 模拟删除相册
 */
export function mockDeleteAlbum(id: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockAlbums.findIndex((a) => a.id === id)
      if (index === -1) {
        reject(new Error('相册不存在'))
        return
      }
      mockAlbums.splice(index, 1)
      resolve()
    }, 300)
  })
}

/**
 * 模拟批量删除相册
 */
export function mockBatchDeleteAlbum(ids: number[]): Promise<{ count: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const count = ids.filter((id) => {
        const index = mockAlbums.findIndex((a) => a.id === id)
        if (index !== -1) {
          mockAlbums.splice(index, 1)
          return true
        }
        return false
      }).length
      resolve({ count })
    }, 300)
  })
}

/**
 * 模拟批量切换相册状态
 */
export function mockBatchToggleAlbumStatus(
  ids: number[],
  status: number
): Promise<{ count: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let count = 0
      ids.forEach((id) => {
        const album = mockAlbums.find((a) => a.id === id)
        if (album) {
          album.status = status
          album.updateBy = 1
          album.updateTime = new Date()
            .toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })
            .replace(/\//g, '-')
          count++
        }
      })
      resolve({ count })
    }, 300)
  })
}
