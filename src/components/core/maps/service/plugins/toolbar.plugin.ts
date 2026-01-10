import type { IAmapPlugin } from '../plugin.interface'
import type { AmapService } from '../amap-service'

/**
 * 缩放工具条位置
 */
type ToolBarPosition = 'LT' | 'RT' | 'LB' | 'RB'

interface ToolBarPluginOptions {
  position?: ToolBarPosition
  /** 是否自动定位 */
  autoPosition?: boolean
  /** 是否使用精简模式 */
  liteStyle?: boolean
}

/**
 * 缩放工具条控件插件
 */
export class ToolBarPlugin implements IAmapPlugin {
  name = 'AMap.ToolBar'
  private toolbar: any = null
  private options: ToolBarPluginOptions

  constructor(options: ToolBarPluginOptions = {}) {
    this.options = {
      position: options.position || 'LT', // 默认左上角
      autoPosition: options.autoPosition !== false,
      liteStyle: options.liteStyle || false
    }
  }

  async install(service: AmapService): Promise<void> {
    const { map, AMap } = service.getContext()
    if (!map || !AMap) {
      throw new Error('地图未初始化')
    }

    return new Promise((resolve, reject) => {
      // 使用 AMap.plugin 异步加载插件
      AMap.plugin('AMap.ToolBar', () => {
        try {
          this.toolbar = new AMap.ToolBar({
            position: this.options.position,
            autoPosition: this.options.autoPosition,
            liteStyle: this.options.liteStyle
          })
          map.addControl(this.toolbar)
          resolve()
        } catch (error) {
          console.error('安装缩放工具条控件失败:', error)
          reject(error)
        }
      })
    })
  }

  uninstall(service: AmapService): void {
    const { map } = service.getContext()
    if (this.toolbar && map) {
      try {
        map.removeControl(this.toolbar)
        this.toolbar = null
      } catch (error) {
        console.error('卸载缩放工具条控件失败:', error)
      }
    }
  }
}
