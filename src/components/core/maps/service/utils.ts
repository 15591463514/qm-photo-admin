import type { LocationInfo, PlaceOption } from './types'
import '../amap-types.d'

/**
 * 默认坐标（北京天安门）
 */
export const DEFAULT_COORDINATES = {
  longitude: 116.397128,
  latitude: 39.903738
}

/**
 * 默认城市
 */
export const DEFAULT_CITY = '全国'

/**
 * 默认缩放级别
 */
export const DEFAULT_ZOOM = 13

/**
 * 验证配置
 */
export function validateConfig(apiKey?: string, securityJsCode?: string): void {
  if (!apiKey || apiKey === 'your-amap-key') {
    throw new Error('高德地图 API Key 未配置')
  }
  if (!securityJsCode) {
    throw new Error('高德地图安全密钥未配置，JS API 2.0 需要安全密钥')
  }
}

/**
 * 设置安全密钥
 */
export function setSecurityConfig(securityJsCode: string): void {
  if (typeof window !== 'undefined') {
    ;(window as any)._AMapSecurityConfig = {
      securityJsCode
    }
  }
}

/**
 * 从逆地理编码结果构建位置信息
 */
export function buildLocationFromRegeocode(
  lng: number,
  lat: number,
  regeocode: AMap.Geocoder.ReGeocode
): LocationInfo {
  const addressComponent = regeocode.addressComponent

  return {
    detail: regeocode.formattedAddress || `${lng}, ${lat}`,
    longitude: lng,
    latitude: lat,
    province: addressComponent.province || undefined,
    city: addressComponent.city || addressComponent.province || undefined,
    district: addressComponent.district || undefined,
    adcode: addressComponent.adcode || undefined
  }
}

/**
 * 从坐标构建基础位置信息
 */
export function buildLocationFromCoordinates(lng: number, lat: number): LocationInfo {
  return {
    detail: `${lng}, ${lat}`,
    longitude: lng,
    latitude: lat
  }
}

/**
 * 转换搜索建议为选项
 */
export function transformTipToOption(tip: AMap.Autocomplete.Tip): PlaceOption {
  const address = (tip.district || '') + (tip.address || '') || tip.name
  // LngLat 类型有 getLng() 和 getLat() 方法，也可以直接访问 lng 和 lat 属性
  const lng =
    typeof tip.location.getLng === 'function' ? tip.location.getLng() : (tip.location as any).lng
  const lat =
    typeof tip.location.getLat === 'function' ? tip.location.getLat() : (tip.location as any).lat
  const value = `${lng},${lat}`

  return {
    value,
    label: `${tip.name} (${address})`,
    name: tip.name,
    address,
    location: {
      lng,
      lat
    }
  }
}

/**
 * 过滤有效的搜索建议
 */
export function filterValidTips(tips: AMap.Autocomplete.Tip[]): AMap.Autocomplete.Tip[] {
  return tips
    .filter((tip) => {
      if (!tip.location) return false
      // LngLat 类型有 getLng() 和 getLat() 方法
      const lng =
        typeof tip.location.getLng === 'function'
          ? tip.location.getLng()
          : (tip.location as any).lng
      const lat =
        typeof tip.location.getLat === 'function'
          ? tip.location.getLat()
          : (tip.location as any).lat
      return lng && lat
    })
    .slice(0, 10)
}

/**
 * 处理搜索回调结果
 */
export function processSearchResult(
  status: AMap.Autocomplete.SearchStatus,
  result: AMap.Autocomplete.SearchResult | string
): PlaceOption[] {
  if (
    status === 'complete' &&
    typeof result !== 'string' &&
    result.tips &&
    result.tips.length > 0
  ) {
    return filterValidTips(result.tips).map(transformTipToOption)
  }
  return []
}
