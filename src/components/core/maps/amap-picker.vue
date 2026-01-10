<!-- 高德地图选择器组件 -->
<template>
  <div class="amap-picker">
    <div class="amap-search-bar">
      <ElSelect
        v-model="selectedPlace"
        filterable
        remote
        reserve-keyword
        placeholder="搜索地点"
        :remote-method="handleRemoteSearch"
        :loading="searchLoading"
        clearable
        @change="handlePlaceSelect"
        style="width: 100%"
      >
        <ElOption
          v-for="item in placeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
          <div class="place-option">
            <div class="place-name">{{ item.name }}</div>
            <div class="place-address">{{ item.address }}</div>
          </div>
        </ElOption>
      </ElSelect>
    </div>
    <div ref="mapContainer" class="amap-container"></div>
    <div v-if="selectedLocation" class="amap-info-area">
      <div class="info-item">
        <span class="label">详细地址：</span>
        <span class="value">{{ selectedLocation.detail }}</span>
      </div>
      <div class="info-item">
        <span class="label">坐标数据：</span>
        <span class="value">{{ selectedLocation.longitude }}, {{ selectedLocation.latitude }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import { ElSelect, ElOption } from 'element-plus'
  import { AmapService } from './service'
  import { ScalePlugin, ToolBarPlugin, MapTypePlugin } from './service/plugins'
  import type { LocationInfo, PlaceOption } from './service'
  import { getAmapConfig, showErrorInContainer } from './picker-utils'

  defineOptions({ name: 'AmapPicker' })

  interface Props {
    /** 初始经度 */
    longitude?: number
    /** 初始纬度 */
    latitude?: number
    /** 高德地图 API Key */
    apiKey?: string
  }

  interface Emits {
    (e: 'change', location: LocationInfo): void
  }

  const props = withDefaults(defineProps<Props>(), {
    longitude: 116.397128,
    latitude: 39.903738,
    apiKey: ''
  })

  const emit = defineEmits<Emits>()

  const mapContainer = ref<HTMLElement>()
  const selectedPlace = ref<string>('')
  const selectedLocation = ref<LocationInfo | null>(null)
  const placeOptions = ref<PlaceOption[]>([])
  const searchLoading = ref(false)

  let amapService: AmapService | null = null

  /**
   * 初始化地图
   */
  const initMap = async () => {
    if (!mapContainer.value) return

    try {
      const config = getAmapConfig(props.apiKey, props.longitude, props.latitude)

      if (!config.apiKey) {
        showErrorInContainer(
          mapContainer.value,
          '高德地图 API Key 未配置',
          '请在 .env 文件中设置 VITE_AMAP_KEY'
        )
        return
      }

      if (!config.securityJsCode) {
        showErrorInContainer(
          mapContainer.value,
          '高德地图安全密钥未配置',
          '请在 .env 文件中设置 VITE_AMAP_SECRET（JS API 2.0 必需）'
        )
        return
      }

      amapService = createAmapService(config)

      // 安装地图控件插件
      amapService
        .use(new ToolBarPlugin({ position: 'LT' })) // 缩放工具条（左上角）
        .use(new ScalePlugin({ position: 'LB' })) // 比例尺（左下角）
        .use(new MapTypePlugin({ position: 'RT' })) // 图层切换（右上角）

      await amapService.init(mapContainer.value)
    } catch (error: any) {
      console.error('地图初始化失败:', error)
      showErrorInContainer(
        mapContainer.value,
        '地图加载失败',
        error?.message || '请检查 API Key 配置'
      )
    }
  }

  /**
   * 创建地图服务实例
   */
  const createAmapService = (config: ReturnType<typeof getAmapConfig>): AmapService => {
    return new AmapService(
      {
        apiKey: config.apiKey!,
        securityJsCode: config.securityJsCode!,
        longitude: config.longitude,
        latitude: config.latitude
      },
      {
        onLocationChange: (location) => {
          selectedLocation.value = location
          emit('change', location)
        }
      }
    )
  }

  /**
   * 远程搜索
   */
  const handleRemoteSearch = async (query: string) => {
    if (!query || !amapService) {
      placeOptions.value = []
      return
    }

    searchLoading.value = true
    try {
      const options = await amapService.searchPlaces(query)
      placeOptions.value = options
    } catch (error) {
      console.error('搜索失败:', error)
      placeOptions.value = []
    } finally {
      searchLoading.value = false
    }
  }

  /**
   * 选择地点
   */
  const handlePlaceSelect = async (value: string) => {
    if (!value || !amapService) return

    const option = placeOptions.value.find((item) => item.value === value)
    if (option) {
      await amapService.setLocation(option.location.lng, option.location.lat)
    }
  }

  /**
   * 监听坐标变化
   */
  watch(
    () => [props.longitude, props.latitude],
    async ([lng, lat]) => {
      if (!shouldUpdateLocation(lng, lat)) return
      await amapService?.setLocation(lng, lat)
    },
    { immediate: false }
  )

  /**
   * 判断是否应该更新位置
   */
  const shouldUpdateLocation = (lng: number, lat: number): boolean => {
    if (!amapService || !lng || !lat || lng === 0 || lat === 0) return false

    const current = selectedLocation.value
    return !(current?.longitude === lng && current?.latitude === lat)
  }

  onMounted(() => {
    initMap()
  })

  onUnmounted(() => {
    if (amapService) {
      amapService.destroy()
      amapService = null
    }
  })

  // 暴露方法
  defineExpose({
    getLocation: () => selectedLocation.value,
    setLocation: async (lng: number, lat: number) => {
      await amapService?.setLocation(lng, lat)
    }
  })
</script>

<style scoped lang="scss">
  .amap-picker {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }

  .amap-search-bar {
    margin-bottom: 12px;
  }

  .place-option {
    display: flex;
    gap: 4px;

    .place-name {
      margin-bottom: 4px;
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    .place-address {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  .amap-container {
    position: relative;
    flex: 1;
    min-height: 400px;
    overflow: hidden;
    border-radius: var(--el-border-radius-base);
  }

  .amap-info-area {
    padding: 8px;
    margin-top: 12px;
    line-height: 1;
    background: var(--el-fill-color-lighter);
    border-radius: var(--el-border-radius-base);

    .info-item {
      margin-bottom: 8px;
      font-size: 14px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        margin-right: 8px;
        color: var(--el-text-color-secondary);
      }

      .value {
        font-weight: 500;
        color: var(--el-text-color-primary);
      }
    }
  }
</style>
