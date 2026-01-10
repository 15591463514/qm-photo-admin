import AMapLoader from '@amap/amap-jsapi-loader'
import type { LocationInfo, PlaceOption, AmapConfig, AmapCallbacks } from './types'
import type { IAmapPlugin } from './plugin.interface'
import {
  DEFAULT_COORDINATES,
  DEFAULT_CITY,
  DEFAULT_ZOOM,
  validateConfig,
  setSecurityConfig,
  buildLocationFromRegeocode,
  buildLocationFromCoordinates,
  processSearchResult
} from './utils'
import '../amap-types.d'

/**
 * 高德地图服务类
 * 封装地图初始化、搜索、定位等功能，支持插件系统
 */
export class AmapService {
  private map: AMap.Map | null = null
  private marker: AMap.Marker | null = null
  private geocoder: AMap.Geocoder | null = null
  private autoComplete: AMap.Autocomplete | null = null
  private placeSearch: AMap.PlaceSearch | null = null
  private container: HTMLElement | null = null
  private config: AmapConfig
  private callbacks: AmapCallbacks = {}
  private AMap: typeof globalThis.AMap | null = null
  private plugins: Map<string, IAmapPlugin> = new Map()

  constructor(config: AmapConfig, callbacks?: AmapCallbacks) {
    this.config = config
    this.callbacks = callbacks || {}
  }

  /**
   * 初始化地图
   */
  async init(container: HTMLElement): Promise<void> {
    this.validateContainer(container)
    this.container = container

    validateConfig(this.config.apiKey, this.config.securityJsCode)
    setSecurityConfig(this.config.securityJsCode!)

    await this.loadAMap()
    this.createMapInstance()
    this.createServices()
    this.bindMapEvents()

    // 安装插件（异步）
    await this.installPlugins()

    if (this.hasInitialCoordinates()) {
      await this.updateLocation(this.config.longitude!, this.config.latitude!)
    }
  }

  /**
   * 验证容器
   */
  private validateContainer(container: HTMLElement): void {
    if (!container) {
      throw new Error('地图容器不能为空')
    }
  }

  /**
   * 加载高德地图 API
   */
  private async loadAMap(): Promise<void> {
    // 基础服务插件列表（控件插件通过 AMap.plugin 异步加载）
    const basePlugins = ['AMap.Geocoder', 'AMap.PlaceSearch', 'AMap.AutoComplete']
    // 合并用户配置的插件
    const userPlugins = this.config.plugins || []
    const allPlugins = [...new Set([...basePlugins, ...userPlugins])] // 去重

    this.AMap = await AMapLoader.load({
      key: this.config.apiKey,
      version: '2.0',
      plugins: allPlugins
    })
  }

  /**
   * 创建地图实例
   */
  private createMapInstance(): void {
    if (!this.AMap || !this.container) return

    const center = this.getCenter()
    const zoom = this.config.zoom || DEFAULT_ZOOM

    this.map = new this.AMap.Map(this.container as HTMLDivElement, {
      zoom,
      center,
      viewMode: '2D'
    })

    this.createMarker(center)
  }

  /**
   * 创建标记
   */
  private createMarker(position: [number, number]): void {
    if (!this.AMap || !this.map) return

    this.marker = new this.AMap.Marker({
      position,
      draggable: true
    })
    this.map.add(this.marker)
  }

  /**
   * 创建服务实例
   */
  private createServices(): void {
    if (!this.AMap || !this.map) return

    const city = this.config.city || DEFAULT_CITY

    // 插件类通过 AMap.plugin 动态加载
    // 类型定义由 @types/amap-js-api-* 提供，使用类型断言访问动态加载的类
    const AMapWithPlugins = this.AMap as typeof AMap & {
      Geocoder: new (options?: AMap.Geocoder.Options) => AMap.Geocoder
      PlaceSearch: new (options?: AMap.PlaceSearch.Options) => AMap.PlaceSearch
      Autocomplete: new (options?: AMap.Autocomplete.Options) => AMap.Autocomplete
    }

    this.geocoder = new AMapWithPlugins.Geocoder({ city })
    this.placeSearch = new AMapWithPlugins.PlaceSearch({
      city,
      map: this.map
      // panel 不设置，表示不使用面板
    })
    this.autoComplete = new AMapWithPlugins.Autocomplete({ city })
  }

  /**
   * 获取地图中心点
   */
  private getCenter(): [number, number] {
    return [
      this.config.longitude || DEFAULT_COORDINATES.longitude,
      this.config.latitude || DEFAULT_COORDINATES.latitude
    ]
  }

  /**
   * 检查是否有初始坐标
   */
  private hasInitialCoordinates(): boolean {
    return !!(this.config.longitude && this.config.latitude)
  }

  /**
   * 安装插件（异步）
   */
  private async installPlugins(): Promise<void> {
    const installPromises = Array.from(this.plugins.values()).map(async (plugin) => {
      try {
        await plugin.install(this)
      } catch (error) {
        console.error(`安装插件 ${plugin.name} 失败:`, error)
      }
    })
    await Promise.all(installPromises)
  }

  /**
   * 绑定地图事件
   */
  private bindMapEvents(): void {
    if (!this.map || !this.marker) return

    this.map.on('click', (e: any) => {
      const { lng, lat } = e.lnglat
      this.handleLocationUpdate(lng, lat, this.callbacks.onMapClick)
    })

    this.marker.on('dragend', (e: any) => {
      const { lng, lat } = e.lnglat
      this.handleLocationUpdate(lng, lat, this.callbacks.onMarkerDrag)
    })
  }

  /**
   * 处理位置更新
   */
  private async handleLocationUpdate(
    lng: number,
    lat: number,
    callback?: (lng: number, lat: number) => void
  ): Promise<void> {
    await this.updateLocation(lng, lat)
    callback?.(lng, lat)
  }

  /**
   * 更新位置
   */
  async updateLocation(lng: number, lat: number): Promise<LocationInfo> {
    this.ensureInitialized()

    this.updateMarkerPosition(lng, lat)
    return this.reverseGeocode(lng, lat)
  }

  /**
   * 确保地图已初始化
   */
  private ensureInitialized(): void {
    if (!this.marker || !this.geocoder || !this.map) {
      throw new Error('地图未初始化')
    }
  }

  /**
   * 更新标记位置
   */
  private updateMarkerPosition(lng: number, lat: number): void {
    if (!this.marker || !this.map) return
    this.marker.setPosition([lng, lat])
    this.map.setCenter([lng, lat])
  }

  /**
   * 逆地理编码
   */
  private reverseGeocode(lng: number, lat: number): Promise<LocationInfo> {
    return new Promise((resolve) => {
      this.geocoder!.getAddress(
        [lng, lat],
        (status: AMap.Geocoder.SearchStatus, result: AMap.Geocoder.ReGeocodeResult | string) => {
          const location = this.parseGeocodeResult(lng, lat, status, result)
          this.callbacks.onLocationChange?.(location)
          resolve(location)
        }
      )
    })
  }

  /**
   * 解析地理编码结果
   */
  private parseGeocodeResult(
    lng: number,
    lat: number,
    status: AMap.Geocoder.SearchStatus,
    result: AMap.Geocoder.ReGeocodeResult | string
  ): LocationInfo {
    if (status === 'complete' && typeof result !== 'string' && result.info === 'OK') {
      return buildLocationFromRegeocode(lng, lat, result.regeocode)
    }
    return buildLocationFromCoordinates(lng, lat)
  }

  /**
   * 搜索地点
   */
  async searchPlaces(keyword: string): Promise<PlaceOption[]> {
    if (!keyword || !this.autoComplete) {
      return []
    }

    return new Promise((resolve) => {
      this.autoComplete!.search(
        keyword,
        (
          status: AMap.Autocomplete.SearchStatus,
          result: AMap.Autocomplete.SearchResult | string
        ) => {
          const options = processSearchResult(status, result)
          resolve(options)
        }
      )
    })
  }

  /**
   * 获取当前位置信息
   */
  getCurrentLocation(): LocationInfo | null {
    if (!this.marker) return null

    const position = this.marker.getPosition()
    if (!position) return null

    // LngLat 类型有 lng 和 lat 属性
    const lng = position.getLng()
    const lat = position.getLat()
    return buildLocationFromCoordinates(lng, lat)
  }

  /**
   * 设置位置
   */
  async setLocation(lng: number, lat: number): Promise<LocationInfo> {
    return this.updateLocation(lng, lat)
  }

  /**
   * 安装插件
   */
  use(plugin: IAmapPlugin): this {
    if (this.plugins.has(plugin.name)) {
      console.warn(`插件 ${plugin.name} 已安装，将跳过`)
      return this
    }

    this.plugins.set(plugin.name, plugin)

    // 如果地图已初始化，立即安装插件（异步）
    if (this.map) {
      plugin.install(this).catch((error) => {
        console.error(`安装插件 ${plugin.name} 失败:`, error)
      })
    }

    return this
  }

  /**
   * 卸载插件
   */
  unuse(pluginName: string): void {
    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      console.warn(`插件 ${pluginName} 未安装`)
      return
    }

    if (plugin.uninstall) {
      try {
        plugin.uninstall(this)
      } catch (error) {
        console.error(`卸载插件 ${pluginName} 失败:`, error)
      }
    }

    this.plugins.delete(pluginName)
  }

  /**
   * 获取插件上下文（供插件使用）
   */
  getContext(): {
    map: AMap.Map | null
    AMap: typeof globalThis.AMap | null
    container: HTMLElement | null
  } {
    return {
      map: this.map!,
      AMap: this.AMap!,
      container: this.container
    }
  }

  /**
   * 销毁地图
   */
  destroy(): void {
    // 卸载所有插件
    this.plugins.forEach((plugin, name) => {
      if (plugin.uninstall) {
        try {
          plugin.uninstall(this)
        } catch (error) {
          console.error(`卸载插件 ${name} 失败:`, error)
        }
      }
    })
    this.plugins.clear()

    this.autoComplete = null
    this.placeSearch = null
    this.geocoder = null

    if (this.marker) {
      this.map?.remove(this.marker)
      this.marker = null
    }

    if (this.map) {
      this.map.destroy()
      this.map = null
    }

    this.container = null
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<AmapConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 更新回调函数
   */
  updateCallbacks(callbacks: Partial<AmapCallbacks>): void {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }
}
