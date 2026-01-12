/**
 * 相册管理相关类型定义
 */

/// <reference path="./common.d.ts" />

declare namespace Api {
  namespace Album {
    /**
     * 相册标签信息
     */
    interface AlbumTagInfo {
      id: number
      label: string
      value: string
    }

    /**
     * 相册信息
     */
    interface AlbumItem {
      id: number
      /** 相册名称 */
      name: string
      /** 封面图片URL */
      coverImage?: string | null
      /** 浏览量 */
      views: number
      /** 关联地址ID */
      addressId?: number | null
      /** 地址名称 */
      addressName?: string | null
      /** 描述 */
      description?: string | null
      /** 状态：1-启用，0-禁用 */
      status: number
      /** 标签列表 */
      tags: AlbumTagInfo[]
      /** 图片数量 */
      imageCount: number
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
     * 相册列表响应（使用标准分页格式）
     */
    type AlbumList = Api.Common.PaginatedResponse<AlbumItem>

    /**
     * 相册列表查询参数
     */
    type AlbumListParams = Partial<
      Pick<AlbumItem, 'addressId' | 'status'> & {
        keyword?: string
        tagId?: number
      } & Api.Common.CommonSearchParams
    >

    /**
     * 创建相册参数
     */
    interface CreateAlbumParams {
      /** 相册名称 */
      name: string
      /** 封面图片URL */
      coverImage?: string
      /** 关联地址ID */
      addressId?: number
      /** 描述 */
      description?: string
      /** 标签ID数组 */
      tagIds?: number[]
      /** 状态 */
      status?: number
    }

    /**
     * 更新相册参数
     */
    interface UpdateAlbumParams extends CreateAlbumParams {
      /** 相册ID */
      id: number
    }
  }
}
