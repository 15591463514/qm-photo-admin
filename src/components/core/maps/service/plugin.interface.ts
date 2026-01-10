import type { AmapService } from './amap-service'

/**
 * 地图插件接口
 */
export interface IAmapPlugin {
  /** 插件名称（对应 AMap 插件名称，如 'AMap.ToolBar'） */
  name: string
  /** 安装插件（异步，使用 AMap.plugin 加载） */
  install(service: AmapService): Promise<void>
  /** 卸载插件 */
  uninstall?(service: AmapService): void
}
