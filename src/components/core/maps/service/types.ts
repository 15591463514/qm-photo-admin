/**
 * 位置信息接口
 */
export interface LocationInfo {
  detail: string
  longitude: number
  latitude: number
  province?: string
  city?: string
  district?: string
  adcode?: string
}

/**
 * POI 搜索建议项
 */
export interface PlaceOption {
  value: string
  label: string
  name: string
  address: string
  location: {
    lng: number
    lat: number
  }
}

/**
 * 地图配置选项
 */
export interface AmapConfig {
  apiKey: string
  securityJsCode?: string // 安全密钥（JS API 2.0 必需）
  longitude?: number
  latitude?: number
  zoom?: number
  city?: string
  plugins?: string[] // 需要加载的插件列表
}

/**
 * 地图事件回调
 */
export interface AmapCallbacks {
  onLocationChange?: (location: LocationInfo) => void
  onMapClick?: (lng: number, lat: number) => void
  onMarkerDrag?: (lng: number, lat: number) => void
}
