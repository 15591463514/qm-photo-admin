import type { IAmapPlugin } from '../plugin.interface'
import type { AmapService } from '../amap-service'

/**
 * 图层切换控件位置
 */
type MapTypePosition = 'LT' | 'RT' | 'LB' | 'RB'

interface MapTypePluginOptions {
  position?: MapTypePosition
  /** 默认图层类型：0-标准地图，1-卫星地图 */
  defaultType?: number
}

/**
 * 图层切换控件插件
 */
export class MapTypePlugin implements IAmapPlugin {
  name = 'AMap.MapType'
  private mapType: any = null
  private options: MapTypePluginOptions

  constructor(options: MapTypePluginOptions = {}) {
    this.options = {
      position: options.position || 'RT', // 默认右上角
      defaultType: options.defaultType || 0 // 0-标准地图，1-卫星地图
    }
  }

  async install(service: AmapService): Promise<void> {
    const { map, AMap } = service.getContext()
    if (!map || !AMap) {
      throw new Error('地图未初始化')
    }

    return new Promise((resolve, reject) => {
      // 使用 AMap.plugin 异步加载插件
      AMap.plugin('AMap.MapType', () => {
        try {
          this.mapType = new (AMap as any).MapType({
            position: this.options.position,
            defaultType: this.options.defaultType,
            showRoad: false, // 不显示路网图层
            showTraffic: false // 不显示实时交通图层
          })
          map.addControl(this.mapType)
          resolve()
        } catch (error) {
          console.error('安装图层切换控件失败:', error)
          reject(error)
        }
      })
    })
  }

  uninstall(service: AmapService): void {
    const { map } = service.getContext()
    if (this.mapType && map) {
      try {
        map.removeControl(this.mapType)
        this.mapType = null
      } catch (error) {
        console.error('卸载图层切换控件失败:', error)
      }
    }
  }
}
