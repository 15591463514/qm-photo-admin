// import request from '@/utils/http'
import {
  mockGetAlbumList,
  mockGetAlbumDetail,
  mockCreateAlbum,
  mockUpdateAlbum,
  mockDeleteAlbum,
  mockBatchDeleteAlbum,
  mockBatchToggleAlbumStatus
} from '@/mock/album'

/**
 * 获取相册列表
 */
export function fetchGetAlbumList(params: Api.Album.AlbumListParams) {
  // 使用 mock 数据
  return mockGetAlbumList(params)

  // 实际接口调用（注释掉，等后端接口准备好后启用）
  // return request.get<Api.Album.AlbumList>({
  //   url: '/api/album/list',
  //   params
  // })
}

/**
 * 获取相册详情
 */
export function fetchGetAlbumDetail(id: number) {
  // 使用 mock 数据
  return mockGetAlbumDetail(id)

  // 实际接口调用（注释掉，等后端接口准备好后启用）
  // return request.get<Api.Album.AlbumItem>({
  //   url: `/api/album/${id}`
  // })
}

/**
 * 创建相册
 */
export function fetchCreateAlbum(params: Api.Album.CreateAlbumParams) {
  // 使用 mock 数据
  return mockCreateAlbum(params)

  // 实际接口调用（注释掉，等后端接口准备好后启用）
  // return request.post<Api.Album.AlbumItem>({
  //   url: '/api/album',
  //   params
  // })
}

/**
 * 更新相册
 */
export function fetchUpdateAlbum(params: Api.Album.UpdateAlbumParams) {
  // 使用 mock 数据
  return mockUpdateAlbum(params)

  // 实际接口调用（注释掉，等后端接口准备好后启用）
  // return request.put<Api.Album.AlbumItem>({
  //   url: `/api/album/${params.id}`,
  //   params
  // })
}

/**
 * 删除相册
 */
export function fetchDeleteAlbum(id: number) {
  // 使用 mock 数据
  return mockDeleteAlbum(id)

  // 实际接口调用（注释掉，等后端接口准备好后启用）
  // return request.del<void>({
  //   url: `/api/album/${id}`
  // })
}

/**
 * 批量删除相册
 */
export function fetchBatchDeleteAlbum(ids: number[]) {
  // 使用 mock 数据
  return mockBatchDeleteAlbum(ids)

  // 实际接口调用（注释掉，等后端接口准备好后启用）
  // return request.del<void>({
  //   url: '/api/album/batch',
  //   data: { ids }
  // })
}

/**
 * 批量切换相册状态
 * @param ids 相册ID数组
 * @param status 状态（1-启用，0-禁用）
 */
export function fetchBatchToggleAlbumStatus(ids: number[], status: number) {
  // 使用 mock 数据
  return mockBatchToggleAlbumStatus(ids, status)

  // 实际接口调用（注释掉，等后端接口准备好后启用）
  // return request.patch<{ count: number }>({
  //   url: '/api/album/batch/status',
  //   params: { ids, status }
  // })
}
