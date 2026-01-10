// import request from '@/utils/http'
import { mockGetImageList, mockUploadImage, mockDeleteImage, mockSearchUsers } from '@/mock/image'

/**
 * 获取图片列表
 * @param params 查询参数
 * @returns 图片列表
 */
export function fetchGetImageList(params: Api.Image.ImageListParams = {}) {
  // 使用 mock 数据
  return mockGetImageList(params)

  // 实际接口调用（注释掉，等后端接口准备好后启用）
  // return request.get<Api.Image.ImageList>({
  //   url: '/api/image/list',
  //   params
  // })
}

/**
 * 上传图片
 * @param file 图片文件
 * @param config 上传配置（所有者、标签、地点）
 * @returns 上传结果
 */
export function fetchUploadImage(file: File, config?: Api.Image.ImageUploadParams) {
  // 使用 mock 数据
  return mockUploadImage(file, config)

  // 实际接口调用（注释掉，等后端接口准备好后启用）
  // const formData = new FormData()
  // formData.append('file', file)
  // if (config?.ownerId) {
  //   formData.append('ownerId', String(config.ownerId))
  // }
  // if (config?.tags && config.tags.length > 0) {
  //   formData.append('tags', JSON.stringify(config.tags))
  // }
  // if (config?.location) {
  //   formData.append('location', config.location)
  // }
  // return request.post<Api.Image.ImageUploadResponse>({
  //   url: '/api/image/upload',
  //   params: formData,
  //   headers: {
  //     'Content-Type': 'multipart/form-data'
  //   }
  // })
}

/**
 * 删除图片
 * @param id 图片ID
 * @returns 删除结果
 */
export function fetchDeleteImage(id: number) {
  // 使用 mock 数据
  return mockDeleteImage(id)

  // 实际接口调用（注释掉，等后端接口准备好后启用）
  // return request.del<Api.Image.ImageDeleteResponse>({
  //   url: `/api/image/${id}`
  // })
}

/**
 * 搜索用户（远程搜索）
 * @param keyword 搜索关键词（邮箱、账号、昵称、电话）
 * @returns 用户列表
 */
export function fetchSearchUsers(keyword: string) {
  // 使用 mock 数据
  return mockSearchUsers(keyword)

  // 实际接口调用（注释掉，等后端接口准备好后启用）
  // return request.get<Api.Image.UserSearchItem[]>({
  //   url: '/api/user/search',
  //   params: { keyword }
  // })
}
