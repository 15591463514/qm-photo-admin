/**
 * 自定义 Marker 类
 * 用于创建不同样式的地图标记点
 */
import './amap-types.d'

export interface CustomMarkerOptions {
  /** 位置 [经度, 纬度] */
  position: [number, number]
  /** 标题 */
  title?: string
  /** 标签内容 */
  label?: string
  /** 标签位置 */
  labelPosition?: 'top' | 'right' | 'bottom' | 'left'
  /** 图标配置 */
  icon?: {
    /** 图标图片 URL 或 SVG 字符串 */
    image: string
    /** 图标大小（像素） */
    size: number
    /** 图标偏移量（可选，默认居中） */
    offset?: [number, number]
  }
  /** 是否可拖拽 */
  draggable?: boolean
  /** z-index */
  zIndex?: number
}

/**
 * 自定义 Marker 类
 */
export class CustomMarker {
  private marker: AMap.Marker | null = null
  private AMap: typeof globalThis.AMap

  constructor(AMap: typeof globalThis.AMap, options: CustomMarkerOptions) {
    this.AMap = AMap
    this.createMarker(options)
  }

  /**
   * 创建 Marker
   */
  private createMarker(options: CustomMarkerOptions): void {
    const iconConfig = options.icon
    let icon: any = undefined

    // 如果提供了图标配置，创建自定义图标
    if (iconConfig) {
      const { image, size } = iconConfig
      const imageUrl =
        image.startsWith('data:') || image.startsWith('http')
          ? image
          : 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(image)

      icon = new this.AMap.Icon({
        size: new this.AMap.Size(size, size),
        image: imageUrl,
        // imageOffset: new this.AMap.Pixel(offset ? offset[0] : -size / 2, offset ? offset[1] : -size / 2),
        imageSize: new this.AMap.Size(size, size)
      })
    }

    // 创建标签配置
    const labelConfig = options.label
      ? {
          content: `<span style="color: black; ">${options.label}</span>`,
          direction: options.labelPosition || 'right',
          offset: this.getLabelOffset(
            options.labelPosition || 'right',
            (iconConfig?.size || 20) / 2
          )
        }
      : undefined

    // 创建 Marker 实例
    this.marker = new this.AMap.Marker({
      position: options.position,
      title: options.title,
      icon: icon,
      label: labelConfig,
      draggable: options.draggable || false,
      zIndex: options.zIndex || 100
    })
  }

  /**
   * 获取标签偏移量
   */
  private getLabelOffset(position: string, iconSize: number): any {
    const offset = iconSize / 2 + 5
    switch (position) {
      case 'top':
        return new this.AMap.Pixel(0, -offset)
      case 'bottom':
        return new this.AMap.Pixel(0, offset)
      case 'left':
        return new this.AMap.Pixel(-offset, 0)
      case 'right':
      default:
        return new this.AMap.Pixel(offset, 0)
    }
  }

  /**
   * 获取 Marker 实例
   */
  getMarker(): AMap.Marker | null {
    return this.marker
  }

  /**
   * 设置位置
   */
  setPosition(position: [number, number]): void {
    if (this.marker) {
      this.marker.setPosition(position)
    }
  }

  /**
   * 获取位置
   */
  getPosition(): any {
    return this.marker?.getPosition()
  }

  /**
   * 显示
   */
  show(): void {
    if (this.marker) {
      this.marker.show()
    }
  }

  /**
   * 隐藏
   */
  hide(): void {
    if (this.marker) {
      this.marker.hide()
    }
  }

  /**
   * 设置标签
   */
  setLabel(label: string): void {
    if (this.marker && label) {
      this.marker.setLabel({
        content: `<span style="background: rgba(64, 158, 255, 0.9); color: #fff; padding: 3px 8px; border-radius: 4px; font-size: 12px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${label}</span>`,
        offset: new this.AMap.Pixel(0, 0),
        direction: 'right'
      } as any)
    }
  }

  /**
   * 绑定事件
   */
  on(event: string, handler: (e: any) => void): void {
    if (this.marker) {
      this.marker.on(event as any, handler)
    }
  }

  /**
   * 解绑事件
   */
  off(event: string, handler?: (e: any) => void): void {
    if (this.marker && handler) {
      this.marker.off(event as any, handler)
    }
  }
}
