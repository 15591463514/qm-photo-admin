/**
 * 模拟图片列表数据
 */
export const mockImages: Api.Image.ImageItem[] = [
  {
    id: 1,
    name: '风景照-001.jpg',
    url: 'https://picsum.photos/1920/1080?random=1',
    size: 2048576,
    format: 'jpg',
    width: 1920,
    height: 1080,
    description: '美丽的自然风景',
    uploadTime: '2024-01-15 10:30:00',
    uploader: 'admin',
    ownerId: 1,
    ownerName: '管理员',
    albumId: 1, // 属于"自然风光"相册
    tags: ['自然', '风景', '户外'],
    location: '北京市朝阳区奥林匹克公园',
    views: 125
  },
  {
    id: 2,
    name: '人物照-002.png',
    url: 'https://picsum.photos/1200/1600?random=2',
    size: 1536000,
    format: 'png',
    width: 1200,
    height: 1600,
    description: '人物肖像',
    uploadTime: '2024-01-15 11:00:00',
    uploader: 'user1',
    ownerId: 2,
    ownerName: '用户一',
    albumId: 3, // 属于"人物肖像"相册
    tags: ['人物', '肖像'],
    location: '上海市黄浦区外滩中山东一路',
    views: 89
  },
  {
    id: 3,
    name: '建筑照-003.jpg',
    url: 'https://picsum.photos/2048/1536?random=3',
    size: 3072000,
    format: 'jpg',
    width: 2048,
    height: 1536,
    description: '现代建筑',
    uploadTime: '2024-01-15 12:15:00',
    uploader: 'admin',
    ownerId: 1,
    ownerName: '管理员',
    albumId: 2, // 属于"城市建筑"相册
    tags: ['建筑', '现代', '城市'],
    location: '深圳市南山区科技园南区',
    views: 67
  },
  {
    id: 4,
    name: '动物照-004.jpg',
    url: 'https://picsum.photos/800/1200?random=4',
    size: 1843200,
    format: 'jpg',
    width: 800,
    height: 1200,
    description: '可爱的小动物',
    uploadTime: '2024-01-15 13:20:00',
    uploader: 'user2',
    ownerId: 3,
    ownerName: '用户二',
    tags: ['动物', '可爱'],
    location: '广州市天河区珠江新城花城广场',
    views: 156
  },
  {
    id: 5,
    name: '美食照-005.jpg',
    url: 'https://picsum.photos/1200/1200?random=5',
    size: 2560000,
    format: 'jpg',
    width: 1200,
    height: 1200,
    description: '美味佳肴',
    uploadTime: '2024-01-15 14:30:00',
    uploader: 'admin',
    ownerId: 1,
    ownerName: '管理员',
    tags: ['美食', '料理'],
    location: '成都市锦江区春熙路步行街',
    views: 203
  },
  {
    id: 6,
    name: '夜景照-006.jpg',
    url: 'https://picsum.photos/2560/1440?random=6',
    size: 4096000,
    format: 'jpg',
    width: 2560,
    height: 1440,
    description: '城市夜景',
    uploadTime: '2024-01-15 15:45:00',
    uploader: 'user1',
    ownerId: 2,
    ownerName: '用户一',
    tags: ['夜景', '城市', '灯光'],
    location: '杭州市西湖区西湖景区断桥残雪',
    views: 178
  },
  {
    id: 7,
    name: '横屏照-007.jpg',
    url: 'https://picsum.photos/1600/900?random=7',
    size: 2200000,
    format: 'jpg',
    width: 1600,
    height: 900,
    description: '横屏风景',
    uploadTime: '2024-01-16 09:00:00',
    uploader: 'admin',
    ownerId: 1,
    ownerName: '管理员',
    tags: ['风景', '横屏'],
    location: '北京市海淀区颐和园昆明湖',
    views: 95
  },
  {
    id: 8,
    name: '竖屏照-008.jpg',
    url: 'https://picsum.photos/900/1600?random=8',
    size: 1800000,
    format: 'jpg',
    width: 900,
    height: 1600,
    description: '竖屏人物',
    uploadTime: '2024-01-16 10:15:00',
    uploader: 'user1',
    ownerId: 2,
    ownerName: '用户一',
    tags: ['人物', '竖屏'],
    location: '上海市静安区南京西路恒隆广场',
    views: 112
  },
  {
    id: 9,
    name: '方形照-009.jpg',
    url: 'https://picsum.photos/1000/1000?random=9',
    size: 2000000,
    format: 'jpg',
    width: 1000,
    height: 1000,
    description: '方形美食',
    uploadTime: '2024-01-16 11:30:00',
    uploader: 'user2',
    ownerId: 3,
    ownerName: '用户二',
    tags: ['美食', '方形'],
    location: '广州市越秀区北京路步行街',
    views: 145
  },
  {
    id: 10,
    name: '超宽屏照-010.jpg',
    url: 'https://picsum.photos/2400/1080?random=10',
    size: 3500000,
    format: 'jpg',
    width: 2400,
    height: 1080,
    description: '超宽屏建筑',
    uploadTime: '2024-01-16 12:45:00',
    uploader: 'admin',
    ownerId: 1,
    ownerName: '管理员',
    tags: ['建筑', '超宽屏'],
    location: '深圳市福田区CBD中心区',
    views: 88
  }
]

/**
 * 模拟获取图片列表
 */
export function mockGetImageList(
  params: Api.Image.ImageListParams = {}
): Promise<Api.Image.ImageList> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { page = 1, pageSize = 10, keyword } = params

      let filteredList = [...mockImages]

      // 按关键词搜索
      if (keyword) {
        const lowerKeyword = keyword.toLowerCase()
        filteredList = filteredList.filter(
          (item) =>
            item.name.toLowerCase().includes(lowerKeyword) ||
            item.description?.toLowerCase().includes(lowerKeyword) ||
            item.ownerName?.toLowerCase().includes(lowerKeyword)
        )
      }

      // 按所有者过滤
      if (params.ownerId) {
        filteredList = filteredList.filter((item) => item.ownerId === params.ownerId)
      }

      // 按标签过滤
      if (params.tags) {
        const tagList = params.tags.split(',').filter((t) => t.trim())
        if (tagList.length > 0) {
          filteredList = filteredList.filter((item) => {
            if (!item.tags || item.tags.length === 0) return false
            return tagList.some((tag) => item.tags?.includes(tag.trim()))
          })
        }
      }

      // 按地点过滤
      if (params.location) {
        filteredList = filteredList.filter((item) => item.location === params.location)
      }

      // 按相册ID过滤
      // if (params.albumId !== undefined) {
      //   filteredList = filteredList.filter((item) => item.albumId === params.albumId)
      // }

      // 按时间范围过滤
      if (params.startTime || params.endTime) {
        filteredList = filteredList.filter((item) => {
          const uploadDate = new Date(item.uploadTime.replace(/-/g, '/'))
          if (params.startTime) {
            const startDate = new Date(params.startTime)
            if (uploadDate < startDate) return false
          }
          if (params.endTime) {
            const endDate = new Date(params.endTime)
            endDate.setHours(23, 59, 59, 999) // 包含结束日期当天
            if (uploadDate > endDate) return false
          }
          return true
        })
      }

      // 分页
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const paginatedList = filteredList.slice(start, end)

      resolve({
        list: paginatedList,
        total: filteredList.length
      })
    }, 500) // 模拟网络延迟
  })
}

/**
 * 模拟上传图片
 */
export function mockUploadImage(
  file: File,
  config?: Api.Image.ImageUploadParams
): Promise<Api.Image.ImageUploadResponse> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 模拟文件大小限制（10MB）
      if (file.size > 10 * 1024 * 1024) {
        reject(new Error('文件大小不能超过 10MB'))
        return
      }

      // 模拟文件类型验证
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        reject(new Error('不支持的文件类型，仅支持 JPG、PNG、GIF、WEBP'))
        return
      }

      // 生成模拟响应
      const newId = mockImages.length + 1
      const format = file.type.split('/')[1] || 'jpg'
      const url = URL.createObjectURL(file) // 使用本地 URL 作为预览

      // 获取所有者名称
      const owner = mockUsers.find((u) => u.id === config?.ownerId)
      const ownerName = owner ? owner.nickName || owner.userName : undefined

      const newImage: Api.Image.ImageItem = {
        id: newId,
        name: file.name,
        url,
        size: file.size,
        format,
        uploadTime: new Date().toLocaleString('zh-CN'),
        uploader: 'current_user',
        ownerId: config?.ownerId,
        ownerName,
        tags: config?.tags || [],
        location: config?.location,
        views: 0
      }

      // 添加到列表（实际应该是后端返回）
      mockImages.unshift(newImage)

      resolve({
        id: newId,
        url,
        name: file.name,
        size: file.size,
        format
      })
    }, 1000) // 模拟上传延迟
  })
}

/**
 * 模拟删除图片
 */
export function mockDeleteImage(id: number): Promise<Api.Image.ImageDeleteResponse> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockImages.findIndex((item) => item.id === id)
      if (index === -1) {
        reject(new Error('图片不存在'))
        return
      }

      // 从列表中删除
      mockImages.splice(index, 1)

      resolve({
        message: '删除成功'
      })
    }, 300)
  })
}

/**
 * 模拟用户数据
 */
const mockUsers: Api.Image.UserSearchItem[] = [
  {
    id: 1,
    userName: 'admin',
    nickName: '管理员',
    email: 'admin@example.com',
    mobile: '13800138000'
  },
  {
    id: 2,
    userName: 'user1',
    nickName: '用户一',
    email: 'user1@example.com',
    mobile: '13800138001'
  },
  {
    id: 3,
    userName: 'user2',
    nickName: '用户二',
    email: 'user2@example.com',
    mobile: '13800138002'
  },
  {
    id: 4,
    userName: 'zhangsan',
    nickName: '张三',
    email: 'zhangsan@example.com',
    mobile: '13800138003'
  },
  { id: 5, userName: 'lisi', nickName: '李四', email: 'lisi@example.com', mobile: '13800138004' },
  {
    id: 6,
    userName: 'wangwu',
    nickName: '王五',
    email: 'wangwu@example.com',
    mobile: '13800138005'
  }
]

/**
 * 模拟搜索用户
 */
export function mockSearchUsers(keyword: string): Promise<Api.Image.UserSearchItem[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!keyword || keyword.trim() === '') {
        resolve([])
        return
      }

      const lowerKeyword = keyword.toLowerCase()
      const results = mockUsers.filter(
        (user) =>
          user.userName.toLowerCase().includes(lowerKeyword) ||
          user.nickName?.toLowerCase().includes(lowerKeyword) ||
          user.email?.toLowerCase().includes(lowerKeyword) ||
          user.mobile?.includes(keyword)
      )

      resolve(results)
    }, 300)
  })
}
