import type { IAmapPlugin } from '../plugin.interface'
import type { AmapService } from '../amap-service'

/**
 * 缩放控件位置
 */
type ScalePosition = 'LT' | 'RT' | 'LB' | 'RB'

interface ScalePluginOptions {
  position?: ScalePosition
}

/**
 * 比例尺控件插件
 */
export class ScalePlugin implements IAmapPlugin {
  name = 'AMap.Scale'
  private scale: any = null
  private options: ScalePluginOptions

  constructor(options: ScalePluginOptions = {}) {
    this.options = {
      position: options.position || 'LB' // 默认左下角
    }
  }

  async install(service: AmapService): Promise<void> {
    const { map, AMap } = service.getContext()
    if (!map || !AMap) {
      throw new Error('地图未初始化')
    }

    return new Promise((resolve, reject) => {
      // 使用 AMap.plugin 异步加载插件
      AMap.plugin('AMap.Scale', () => {
        try {
          this.scale = new (AMap as any).Scale({
            position: this.options.position
          })
          map.addControl(this.scale)
          resolve()
        } catch (error) {
          console.error('安装比例尺控件失败:', error)
          reject(error)
        }
      })
    })
  }

  uninstall(service: AmapService): void {
    const { map } = service.getContext()
    if (this.scale && map) {
      try {
        map.removeControl(this.scale)
        this.scale = null
      } catch (error) {
        console.error('卸载比例尺控件失败:', error)
      }
    }
  }
}
