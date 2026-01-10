<!-- 地址地图看板组件 -->
<template>
  <div class="address-map-board">
    <div v-loading="loading" ref="mapContainer" class="map-container"></div>
    <div v-if="!loading && addressList.length === 0" class="empty-tip"> 暂无地址数据 </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import { AmapService, CustomMarker } from '@/components/core/maps/service'
  import { ScalePlugin, ToolBarPlugin, MapTypePlugin } from '@/components/core/maps/service/plugins'
  import type { AmapConfig, CustomMarkerOptions } from '@/components/core/maps/service'
  import '@/components/core/maps/amap-types.d'
  import { mapMarker1Svg } from '@/assets/svg/map-marker-1'
  import { StatusEnum, STATUS_CONFIG } from '@/constants/enums'

  defineOptions({ name: 'AddressMapBoard' })

  interface Props {
    /** 地址列表数据 */
    addressList?: Api.Address.AddressItem[]
    /** 加载状态 */
    loading?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    addressList: () => [],
    loading: false
  })

  const mapContainer = ref<HTMLElement>()
  let amapService: AmapService | null = null
  let markers: CustomMarker[] = []
  let infoWindows: any[] = []

  /**
   * 获取高德地图配置
   */
  const getAmapConfig = (): AmapConfig => {
    const apiKey = import.meta.env.VITE_AMAP_KEY
    const securityJsCode = import.meta.env.VITE_AMAP_SECRET

    if (!apiKey || apiKey === 'your-amap-key') {
      throw new Error('高德地图 API Key 未配置')
    }
    if (!securityJsCode) {
      throw new Error('高德地图安全密钥未配置')
    }

    return {
      apiKey,
      securityJsCode,
      zoom: 10
    }
  }

  /**
   * 初始化地图
   */
  const initMap = async () => {
    if (!mapContainer.value) return

    try {
      const config = getAmapConfig()

      amapService = new AmapService(config)

      // 安装地图控件插件
      amapService
        .use(new ToolBarPlugin({ position: 'LT' })) // 缩放工具条
        .use(new ScalePlugin({ position: 'LB' })) // 比例尺
        .use(new MapTypePlugin({ position: 'RT' })) // 图层切换

      await amapService.init(mapContainer.value)

      // 初始化标记点
      updateMarkers()
    } catch (error: any) {
      console.error('地图初始化失败:', error)
      if (mapContainer.value) {
        mapContainer.value.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #f56c6c; flex-direction: column; gap: 12px;">
            <div>❌ 地图加载失败</div>
            <div style="font-size: 12px;">${error?.message || '请检查 API Key 配置'}</div>
          </div>
        `
      }
    }
  }

  /**
   * 更新地图标记点
   */
  const updateMarkers = () => {
    if (!amapService || !props.addressList || props.addressList.length === 0) {
      return
    }

    // 清除旧标记
    clearMarkers()

    const { map, AMap } = amapService.getContext()
    if (!map || !AMap) return

    const validAddresses = props.addressList.filter(
      (addr) => addr.longitude && addr.latitude && addr.longitude !== 0 && addr.latitude !== 0
    )

    if (validAddresses.length === 0) return

    // 创建标记点（使用自定义 Marker 类）
    validAddresses.forEach((address) => {
      // 配置 marker 选项：使用红色圆形图标，与选择器中的蓝色默认标记区分
      const markerOptions: CustomMarkerOptions = {
        position: [address.longitude, address.latitude],
        title: address.name,
        label: address.name,
        labelPosition: 'right',
        icon: {
          // 外部传入 SVG 图标
          image: mapMarker1Svg,
          size: 20
        },
        zIndex: 100
      }

      const customMarker = new CustomMarker(AMap, markerOptions)
      const marker = customMarker.getMarker()

      // 如果 marker 为 null，跳过
      if (!marker) return

      // 创建信息窗口
      const infoWindow = new AMap.InfoWindow({
        content: createInfoWindowContent(address),
        offset: new AMap.Pixel(0, -10)
      })

      // 点击标记显示信息窗口
      customMarker.on('click', () => {
        // 关闭其他信息窗口
        infoWindows.forEach((iw) => iw.close())
        const position = customMarker.getPosition()
        if (position) {
          infoWindow.open(map, position)
        }
      })

      map.add(marker)
      markers.push(customMarker)
      infoWindows.push(infoWindow)
    })

    // 调整地图视野以显示所有标记
    if (markers.length > 0) {
      const markerInstances = markers.map((m) => m.getMarker()).filter((m) => m !== null)
      if (markerInstances.length > 0) {
        map.setFitView(markerInstances, false, [50, 50, 50, 50])
      }
    }
  }

  /**
   * 创建信息窗口内容
   */
  const createInfoWindowContent = (address: Api.Address.AddressItem): string => {
    const statusConfig = STATUS_CONFIG[address.status as StatusEnum]
    const statusText = statusConfig?.text || '未知'
    const statusColor = statusConfig?.type === 'success' ? '#67c23a' : '#909399'

    return `
      <div style="padding: 8px; min-width: 200px;">
        <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px; color: #303133;">
          ${address.name}
        </div>
        <div style="font-size: 12px; color: #606266; margin-bottom: 4px;">
          <span style="color: #909399;">详细地址：</span>${address.detail}
        </div>
        <div style="font-size: 12px; color: #606266; margin-bottom: 4px;">
          <span style="color: #909399;">坐标：</span>${address.longitude.toFixed(6)}, ${address.latitude.toFixed(6)}
        </div>
        ${
          address.province
            ? `
          <div style="font-size: 12px; color: #606266; margin-bottom: 4px;">
            <span style="color: #909399;">省市区：</span>${address.province}${address.city ? ` / ${address.city}` : ''}${address.district ? ` / ${address.district}` : ''}
          </div>
        `
            : ''
        }
        <div style="font-size: 12px; margin-top: 8px;">
          <span style="color: #909399;">状态：</span>
          <span style="color: ${statusColor}; font-weight: 500;">${statusText}</span>
        </div>
      </div>
    `
  }

  /**
   * 清除所有标记
   */
  const clearMarkers = () => {
    if (!amapService) return

    const { map } = amapService.getContext()
    if (!map) return

    // 关闭所有信息窗口
    infoWindows.forEach((iw) => iw.close())
    infoWindows = []

    // 移除所有标记
    markers.forEach((customMarker) => {
      const marker = customMarker.getMarker()
      if (marker) {
        map.remove(marker)
      }
    })
    markers = []
  }

  // 监听地址列表变化
  watch(
    () => props.addressList,
    () => {
      if (!props.loading) {
        updateMarkers()
      }
    },
    { deep: true }
  )

  // 监听加载状态
  watch(
    () => props.loading,
    (newLoading) => {
      if (!newLoading && amapService) {
        // 加载完成后更新标记
        updateMarkers()
      }
    }
  )

  onMounted(() => {
    initMap()
  })

  onUnmounted(() => {
    clearMarkers()
    if (amapService) {
      amapService.destroy()
      amapService = null
    }
  })
</script>

<style scoped lang="scss">
  .address-map-board {
    position: relative;
    width: 100%;
    height: 94%;
    min-height: 500px;
    margin-top: 12px;
  }

  .map-container {
    width: 100%;
    height: 100%;
    min-height: 500px;
    overflow: hidden;
    border-radius: var(--el-border-radius-base);
  }

  .empty-tip {
    position: absolute;
    top: 50%;
    left: 50%;
    font-size: 14px;
    color: var(--el-text-color-secondary);
    transform: translate(-50%, -50%);
  }
</style>
