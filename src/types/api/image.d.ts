/**
 * 图片管理相关类型定义
 */
declare namespace Api {
  namespace Image {
    /**
     * 图片信息
     */
    interface ImageItem {
      id: number
      /** 图片名称 */
      name: string
      /** 图片URL */
      url: string
      /** 图片大小（字节） */
      size: number
      /** 图片格式 */
      format: string
      /** 图片宽度 */
      width?: number
      /** 图片高度 */
      height?: number
      /** 描述 */
      description?: string
      /** 上传时间 */
      uploadTime: string
      /** 上传者 */
      uploader: string
      /** 图片所有者ID */
      ownerId?: number
      /** 图片所有者名称 */
      ownerName?: string
      /** 标签列表 */
      tags?: string[]
      /** 地点 */
      location?: string
      /** 浏览量 */
      views?: number
    }

    /**
     * 图片列表响应
     */
    interface ImageList {
      list: ImageItem[]
      total: number
    }

    /**
     * 图片列表查询参数
     */
    interface ImageListParams {
      /** 页码 */
      page?: number
      /** 每页数量 */
      pageSize?: number
      /** 搜索关键词 */
      keyword?: string
      /** 图片所有者ID */
      ownerId?: number
      /** 标签（多个用逗号分隔） */
      tags?: string
      /** 地点 */
      location?: string
      /** 开始时间 */
      startTime?: string
      /** 结束时间 */
      endTime?: string
    }

    /**
     * 图片上传参数
     */
    interface ImageUploadParams {
      /** 图片所有者ID */
      ownerId?: number
      /** 标签列表 */
      tags?: string[]
      /** 地点 */
      location?: string
    }

    /**
     * 用户搜索项
     */
    interface UserSearchItem {
      id: number
      userName: string
      nickName?: string
      email?: string
      mobile?: string
    }

    /**
     * 图片上传响应
     */
    interface ImageUploadResponse {
      id: number
      url: string
      name: string
      size: number
      format: string
    }

    /**
     * 删除图片响应
     */
    interface ImageDeleteResponse {
      message: string
    }
  }
}
