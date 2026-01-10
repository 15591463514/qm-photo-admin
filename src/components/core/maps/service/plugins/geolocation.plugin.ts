import type { IAmapPlugin } from '../plugin.interface'
import type { AmapService } from '../amap-service'
import '../../amap-types.d'

interface GeolocationPluginOptions {
  /** 是否显示定位按钮 */
  showButton?: boolean
  /** 定位按钮位置 */
  buttonPosition?: 'LT' | 'RT' | 'LB' | 'RB'
  /** 是否显示定位精度圆圈 */
  showCircle?: boolean
  /** 是否将定位结果转换为地图坐标 */
  convert?: boolean
  /** 是否显示定位标记 */
  showMarker?: boolean
}

/**
 * 定位控件插件
 */
export class GeolocationPlugin implements IAmapPlugin {
  name = 'AMap.Geolocation'
  private geolocation: AMap.Geolocation | null = null
  private options: GeolocationPluginOptions

  constructor(options: GeolocationPluginOptions = {}) {
    this.options = {
      showButton: options.showButton !== false,
      buttonPosition: options.buttonPosition || 'LT',
      showCircle: options.showCircle !== false,
      convert: options.convert !== false,
      showMarker: options.showMarker !== false
    }
  }

  async install(service: AmapService): Promise<void> {
    const { map, AMap } = service.getContext()
    if (!map || !AMap) {
      throw new Error('地图未初始化')
    }

    return new Promise((resolve, reject) => {
      // 使用 AMap.plugin 异步加载插件
      AMap.plugin('AMap.Geolocation', () => {
        try {
          this.geolocation = new (AMap as any).Geolocation({
            enableHighAccuracy: true,
            timeout: 10000,
            buttonPosition: this.options.buttonPosition,
            showCircle: this.options.showCircle,
            convert: this.options.convert,
            showMarker: this.options.showMarker
          })

          if (this.options.showButton && this.geolocation) {
            map.addControl(this.geolocation)
          }

          // 监听定位成功事件
          if (this.geolocation) {
            this.geolocation.on('complete', (data: AMap.Geolocation.GeolocationResult) => {
              console.log('定位成功:', data)
            })

            // 监听定位失败事件
            this.geolocation.on('error', (error: AMap.Geolocation.ErrorStatus) => {
              console.error('定位失败:', error)
            })
          }

          resolve()
        } catch (error) {
          console.error('安装定位控件失败:', error)
          reject(error)
        }
      })
    })
  }

  uninstall(service: AmapService): void {
    const { map } = service.getContext()
    if (this.geolocation && map) {
      try {
        if (this.options.showButton) {
          map.removeControl(this.geolocation)
        }
        this.geolocation = null
      } catch (error) {
        console.error('卸载定位控件失败:', error)
      }
    }
  }

  /**
   * 获取定位实例（用于手动调用定位）
   */
  getInstance(): AMap.Geolocation | null {
    return this.geolocation
  }
}
