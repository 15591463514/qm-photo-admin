/**
 * 高德地图类型声明
 * 合并官方类型定义和插件类型定义
 */

/// <reference types="amap-js-api" />
/// <reference types="amap-js-api-geocoder" />
/// <reference types="amap-js-api-place-search" />
/// <reference types="amap-js-api-autocomplete" />
/// <reference types="amap-js-api-geolocation" />

import '@amap/amap-jsapi-types'

declare global {
  interface Window {
    _AMapSecurityConfig?: {
      securityJsCode: string
    }
  }
}

export {}
