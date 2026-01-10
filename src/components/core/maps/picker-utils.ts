/**
 * 获取高德地图配置
 */
export function getAmapConfig(apiKey?: string, longitude?: number, latitude?: number) {
  return {
    apiKey: apiKey || import.meta.env.VITE_AMAP_KEY,
    securityJsCode: import.meta.env.VITE_AMAP_SECRET,
    longitude,
    latitude
  }
}

/**
 * 在容器中显示错误信息
 */
export function showErrorInContainer(
  container: HTMLElement,
  title: string,
  message: string,
  type: 'warning' | 'error' = 'warning'
): void {
  const icon = type === 'warning' ? '⚠️' : '❌'
  const color = type === 'warning' ? '#909399' : '#f56c6c'

  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: ${color}; flex-direction: column; gap: 12px;">
      <div>${icon} ${title}</div>
      <div style="font-size: 12px;">${message}</div>
    </div>
  `
}
