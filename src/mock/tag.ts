/**
 * Mock 标签组数据
 */
const mockTagGroups: Api.Tag.TagGroup[] = [
  {
    id: 1,
    name: '图片标签',
    code: 'image_tag',
    description: '用于图片上传时的标签分类',
    status: 1,
    sort: 1,
    tags: [
      {
        id: 1,
        groupId: 1,
        label: '风景',
        value: 'landscape',
        sort: 1,
        status: 1,
        creatorId: 1,
        updaterId: 1,
        createdAt: '2024-01-01 10:00:00',
        updatedAt: '2024-01-01 10:00:00'
      },
      {
        id: 2,
        groupId: 1,
        label: '人物',
        value: 'portrait',
        sort: 2,
        status: 1,
        creatorId: 1,
        updaterId: 1,
        createdAt: '2024-01-01 10:00:00',
        updatedAt: '2024-01-01 10:00:00'
      },
      {
        id: 3,
        groupId: 1,
        label: '建筑',
        value: 'architecture',
        sort: 3,
        status: 1,
        creatorId: 1,
        updaterId: 1,
        createdAt: '2024-01-01 10:00:00',
        updatedAt: '2024-01-01 10:00:00'
      }
    ],
    creatorId: 1,
    updaterId: 1,
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    name: '产品标签',
    code: 'product_tag',
    description: '用于产品分类的标签',
    status: 1,
    sort: 2,
    tags: [
      {
        id: 4,
        groupId: 2,
        label: '电子产品',
        value: 'electronics',
        sort: 1,
        status: 1,
        creatorId: 1,
        updaterId: 1,
        createdAt: '2024-01-02 10:00:00',
        updatedAt: '2024-01-02 10:00:00'
      },
      {
        id: 5,
        groupId: 2,
        label: '服装',
        value: 'clothing',
        sort: 2,
        status: 1,
        creatorId: 1,
        updaterId: 1,
        createdAt: '2024-01-02 10:00:00',
        updatedAt: '2024-01-02 10:00:00'
      }
    ],
    creatorId: 1,
    updaterId: 1,
    createdAt: '2024-01-02 10:00:00',
    updatedAt: '2024-01-02 10:00:00'
  }
]

/**
 * Mock 标签数据
 */
const mockTags: Api.Tag.TagItem[] = [
  {
    id: 1,
    groupId: 1,
    label: '风景',
    value: 'landscape',
    sort: 1,
    status: 1,
    creatorId: 1,
    updaterId: 1,
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    groupId: 1,
    label: '人物',
    value: 'portrait',
    sort: 2,
    status: 1,
    creatorId: 1,
    updaterId: 1,
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00'
  },
  {
    id: 3,
    groupId: 1,
    label: '建筑',
    value: 'architecture',
    sort: 3,
    status: 1,
    creatorId: 1,
    updaterId: 1,
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00'
  },
  {
    id: 4,
    groupId: 2,
    label: '电子产品',
    value: 'electronics',
    sort: 1,
    status: 1,
    creatorId: 1,
    updaterId: 1,
    createdAt: '2024-01-02 10:00:00',
    updatedAt: '2024-01-02 10:00:00'
  },
  {
    id: 5,
    groupId: 2,
    label: '服装',
    value: 'clothing',
    sort: 2,
    status: 1,
    creatorId: 1,
    updaterId: 1,
    createdAt: '2024-01-02 10:00:00',
    updatedAt: '2024-01-02 10:00:00'
  }
]

/**
 * Mock 获取标签组列表
 */
export function mockGetTagGroupList(
  params: Api.Tag.TagGroupListParams
): Promise<Api.Tag.TagGroupList> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredList = [...mockTagGroups]

      // 关键词搜索
      if (params.keyword) {
        const keyword = params.keyword.toLowerCase()
        filteredList = filteredList.filter(
          (item) =>
            item.name.toLowerCase().includes(keyword) ||
            item.code.toLowerCase().includes(keyword) ||
            item.description?.toLowerCase().includes(keyword)
        )
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
 * Mock 获取标签组详情
 */
export function mockGetTagGroupDetail(id: number): Promise<Api.Tag.TagGroup> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const group = mockTagGroups.find((item) => item.id === id)
      if (group) {
        resolve(group)
      } else {
        reject(new Error('标签组不存在'))
      }
    }, 200)
  })
}

/**
 * Mock 创建标签组
 */
export function mockCreateTagGroup(
  params: Api.Tag.CreateTagGroupParams
): Promise<Api.Tag.TagGroup> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newGroup: Api.Tag.TagGroup = {
        id: mockTagGroups.length + 1,
        ...params,
        status: params.status ?? 1,
        sort: params.sort ?? mockTagGroups.length + 1,
        tags: [],
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
      mockTagGroups.unshift(newGroup)
      resolve(newGroup)
    }, 300)
  })
}

/**
 * Mock 更新标签组
 */
export function mockUpdateTagGroup(
  params: Api.Tag.UpdateTagGroupParams
): Promise<Api.Tag.TagGroup> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockTagGroups.findIndex((item) => item.id === params.id)
      if (index !== -1) {
        const updatedGroup: Api.Tag.TagGroup = {
          ...mockTagGroups[index],
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
        mockTagGroups[index] = updatedGroup
        resolve(updatedGroup)
      } else {
        reject(new Error('标签组不存在'))
      }
    }, 300)
  })
}

/**
 * Mock 删除标签组
 */
export function mockDeleteTagGroup(id: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockTagGroups.findIndex((item) => item.id === id)
      if (index !== -1) {
        mockTagGroups.splice(index, 1)
        // 同时删除该组下的所有标签
        const tagIndexes: number[] = []
        mockTags.forEach((tag, idx) => {
          if (tag.groupId === id) {
            tagIndexes.push(idx)
          }
        })
        tagIndexes.reverse().forEach((idx) => {
          mockTags.splice(idx, 1)
        })
        resolve()
      } else {
        reject(new Error('标签组不存在'))
      }
    }, 300)
  })
}

/**
 * Mock 批量删除标签组
 */
export function mockBatchDeleteTagGroup(ids: number[]): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      ids.forEach((id) => {
        const index = mockTagGroups.findIndex((item) => item.id === id)
        if (index !== -1) {
          mockTagGroups.splice(index, 1)
          // 同时删除该组下的所有标签
          const tagIndexes: number[] = []
          mockTags.forEach((tag, idx) => {
            if (tag.groupId === id) {
              tagIndexes.push(idx)
            }
          })
          tagIndexes.reverse().forEach((idx) => {
            mockTags.splice(idx, 1)
          })
        }
      })
      resolve()
    }, 300)
  })
}

/**
 * Mock 获取标签列表
 */
export function mockGetTagItemList(
  params: Api.Tag.TagItemListParams
): Promise<{ list: Api.Tag.TagItem[]; total: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredList = mockTags.filter((item) => item.groupId === params.groupId)

      // 关键词搜索
      if (params.keyword) {
        const keyword = params.keyword.toLowerCase()
        filteredList = filteredList.filter(
          (item) =>
            item.label.toLowerCase().includes(keyword) || item.value.toLowerCase().includes(keyword)
        )
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
 * Mock 获取标签详情
 */
export function mockGetTagItemDetail(id: number): Promise<Api.Tag.TagItem> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const tag = mockTags.find((item) => item.id === id)
      if (tag) {
        resolve(tag)
      } else {
        reject(new Error('标签不存在'))
      }
    }, 200)
  })
}

/**
 * Mock 创建标签
 */
export function mockCreateTagItem(params: Api.Tag.CreateTagItemParams): Promise<Api.Tag.TagItem> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const groupTags = mockTags.filter((tag) => tag.groupId === params.groupId)
      const newTag: Api.Tag.TagItem = {
        id: mockTags.length + 1,
        ...params,
        sort: params.sort ?? groupTags.length + 1,
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
      mockTags.push(newTag)
      // 更新标签组中的标签列表
      const group = mockTagGroups.find((g) => g.id === params.groupId)
      if (group) {
        if (!group.tags) {
          group.tags = []
        }
        group.tags.push(newTag)
      }
      resolve(newTag)
    }, 300)
  })
}

/**
 * Mock 更新标签
 */
export function mockUpdateTagItem(params: Api.Tag.UpdateTagItemParams): Promise<Api.Tag.TagItem> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockTags.findIndex((item) => item.id === params.id)
      if (index !== -1) {
        const updatedTag: Api.Tag.TagItem = {
          ...mockTags[index],
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
        mockTags[index] = updatedTag
        // 更新标签组中的标签列表
        const group = mockTagGroups.find((g) => g.id === params.groupId)
        if (group && group.tags) {
          const tagIndex = group.tags.findIndex((t) => t.id === params.id)
          if (tagIndex !== -1) {
            group.tags[tagIndex] = updatedTag
          }
        }
        resolve(updatedTag)
      } else {
        reject(new Error('标签不存在'))
      }
    }, 300)
  })
}

/**
 * Mock 删除标签
 */
export function mockDeleteTagItem(id: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockTags.findIndex((item) => item.id === id)
      if (index !== -1) {
        const tag = mockTags[index]
        mockTags.splice(index, 1)
        // 从标签组中移除
        const group = mockTagGroups.find((g) => g.id === tag.groupId)
        if (group && group.tags) {
          const tagIndex = group.tags.findIndex((t) => t.id === id)
          if (tagIndex !== -1) {
            group.tags.splice(tagIndex, 1)
          }
        }
        resolve()
      } else {
        reject(new Error('标签不存在'))
      }
    }, 300)
  })
}

/**
 * Mock 批量删除标签
 */
export function mockBatchDeleteTagItem(ids: number[]): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      ids.forEach((id) => {
        const index = mockTags.findIndex((item) => item.id === id)
        if (index !== -1) {
          const tag = mockTags[index]
          mockTags.splice(index, 1)
          // 从标签组中移除
          const group = mockTagGroups.find((g) => g.id === tag.groupId)
          if (group && group.tags) {
            const tagIndex = group.tags.findIndex((t) => t.id === id)
            if (tagIndex !== -1) {
              group.tags.splice(tagIndex, 1)
            }
          }
        }
      })
      resolve()
    }, 300)
  })
}
