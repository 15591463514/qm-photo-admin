<!-- 图片管理页面 -->
<template>
  <div class="art-full-height">
    <div class="flex-c">
      <!-- 相册导航栏（从相册进入时显示） -->
      <div v-if="currentAlbumId" class="flex-c items-center gap-3">
        <div class="flex-c items-center gap-3">
          <ElButton type="primary" link @click="handleBackToAlbum">
            <ElIcon><ArrowLeft /></ElIcon>
            返回相册
          </ElButton>
          <ElDivider direction="vertical" />
          <div class="flex-c items-center gap-2">
            <span class="text-g-600">当前相册：</span>
            <span>{{ currentAlbumName || '未命名相册' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索栏 -->
    <ImageSearch
      v-show="showSearchBar"
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    />

    <ElCard
      class="art-table-card"
      shadow="never"
      :style="{ 'margin-top': showSearchBar ? '12px' : '0' }"
    >
      <!-- 表格头部 -->
      <ArtTableHeader
        v-model:columns="columnChecks"
        v-model:showSearchBar="showSearchBar"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <!-- 上传按钮 -->
          <div class="flex-c gap-3">
            <!-- 选择/查看模式切换 -->
            <ElSegmented
              :model-value="selectMode ? 'edit' : 'view'"
              :options="selectModeOptions"
              size="default"
              @change="(val: string | number) => (selectMode = val === 'edit')"
            />
            <!-- 视图模式切换 -->
            <ElSegmented
              :model-value="viewMode"
              :options="viewModeOptions"
              size="default"
              @change="handleModeChange as any"
            />
            <ElButton
              v-if="!selectMode"
              type="primary"
              plain
              v-ripple
              @click="handleOpenUploadDialog"
            >
              <ElIcon><Upload /></ElIcon>
              上传图片
            </ElButton>

            <!-- 选择模式：显示全选和批量操作按钮 -->
            <template v-if="selectMode">
              <!-- 大图和小图模式显示全选 -->
              <ElCheckbox
                v-if="viewMode === 'large' || viewMode === 'small'"
                v-model="isAllSelected"
                :indeterminate="isIndeterminate"
                @change="(val: any) => handleSelectAll(!!val)"
                class="ml-4"
              >
                全选
              </ElCheckbox>
              <ElButton
                type="primary"
                plain
                @click="handleBatchEdit"
                :disabled="loading || selectedImages.length === 0"
                class="ml-4"
              >
                <ElIcon><Edit /></ElIcon>
                批量编辑{{ selectedImages.length > 0 ? ` (${selectedImages.length})` : '' }}
              </ElButton>
              <ElButton
                type="danger"
                plain
                @click="handleBatchDelete"
                :disabled="loading || selectedImages.length === 0"
                class="ml-2"
              >
                <ElIcon><Delete /></ElIcon>
                批量删除{{ selectedImages.length > 0 ? ` (${selectedImages.length})` : '' }}
              </ElButton>
            </template>
          </div>
        </template>
      </ArtTableHeader>

      <!-- 内容区域（可滚动） -->
      <div class="table-content-scrollable mt-4">
        <!-- 大图模式 -->
        <template v-if="viewMode === 'large'">
          <!-- 加载状态 -->
          <div v-if="loading" class="flex-cc py-20 mt-4">
            <ElIcon class="is-loading text-4xl text-g-400"><Loading /></ElIcon>
          </div>

          <!-- 图片网格 -->
          <div v-else-if="imageList.length > 0" class="image-grid image-grid-large">
            <div
              v-for="image in imageList"
              :key="image.id"
              class="image-item-wrapper relative"
              :class="{
                'select-mode': selectMode,
                selected: selectMode && isImageSelected(image.id)
              }"
              @click="selectMode ? handleImageToggle(image.id) : handleImageClick(image)"
            >
              <!-- 选择模式：显示选中蒙版和勾选图标 -->
              <div v-if="selectMode" class="selection-overlay">
                <div v-if="isImageSelected(image.id)" class="selection-check">
                  <ElIcon class="check-icon"><Check /></ElIcon>
                </div>
              </div>
              <ArtImageCard
                :image-url="image.url"
                :title="image.name"
                :views="image.views"
                :category="image.tags"
                :date="formatDate(image.uploadTime)"
                :class="{
                  'pointer-events-none': selectMode,
                  'image-card-selected': selectMode && isImageSelected(image.id)
                }"
              />
              <!-- 编辑模式：显示操作按钮 -->
              <div class="image-card-actions" @click.stop>
                <ElButton
                  type="primary"
                  link
                  size="small"
                  :style="{
                    opacity: selectMode ? 1 : 0,
                    pointerEvents: selectMode ? 'auto' : 'none'
                  }"
                  @click="handleEdit(image)"
                >
                  编辑
                </ElButton>
                <ElButton
                  type="danger"
                  link
                  size="small"
                  :style="{
                    opacity: selectMode ? 1 : 0,
                    pointerEvents: selectMode ? 'auto' : 'none'
                  }"
                  @click="handleDelete(image)"
                >
                  删除
                </ElButton>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <ElEmpty v-else description="暂无图片" class="mt-4" />

          <!-- 分页 -->
          <div v-if="imageList.length > 0" class="flex-c justify-center mt-6">
            <ElPagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :total="pagination.total"
              :page-sizes="[12, 24, 48, 96]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </template>

        <!-- 小图模式 -->
        <template v-else-if="viewMode === 'small'">
          <!-- 加载状态 -->
          <div v-if="loading" class="flex-cc py-20 mt-4">
            <ElIcon class="is-loading text-4xl text-g-400"><Loading /></ElIcon>
          </div>

          <!-- 小图网格 -->
          <div v-else-if="imageList.length > 0" class="image-grid image-grid-small mt-4">
            <div
              v-for="image in imageList"
              :key="image.id"
              class="image-item-small-wrapper relative c-p"
              :class="{
                'select-mode': selectMode,
                selected: selectMode && isImageSelected(image.id)
              }"
              @click="selectMode ? handleImageToggle(image.id) : handleImageClick(image)"
            >
              <!-- 选择模式：显示选中蒙版和勾选图标 -->
              <div v-if="selectMode" class="selection-overlay-small">
                <div v-if="isImageSelected(image.id)" class="selection-check-small">
                  <ElIcon class="check-icon-small"><Check /></ElIcon>
                </div>
              </div>
              <ElImage
                :src="image.url"
                fit="cover"
                class="image-small"
                :class="{ 'image-small-selected': selectMode && isImageSelected(image.id) }"
              >
                <template #placeholder>
                  <div class="flex-cc w-full h-full bg-[#f5f7fa]">
                    <ElIcon><Picture /></ElIcon>
                  </div>
                </template>
              </ElImage>
              <!-- 编辑模式：显示操作按钮 -->
              <div class="image-card-actions-small" @click.stop>
                <ElButton
                  type="primary"
                  link
                  size="small"
                  :style="{
                    opacity: selectMode ? 1 : 0,
                    pointerEvents: selectMode ? 'auto' : 'none'
                  }"
                  @click="handleEdit(image)"
                >
                  编辑
                </ElButton>
                <ElButton
                  type="danger"
                  link
                  size="small"
                  :style="{
                    opacity: selectMode ? 1 : 0,
                    pointerEvents: selectMode ? 'auto' : 'none'
                  }"
                  @click="handleDelete(image)"
                >
                  删除
                </ElButton>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <ElEmpty v-else description="暂无图片" class="mt-4" />

          <!-- 分页 -->
          <div v-if="imageList.length > 0" class="flex-c justify-center mt-6">
            <ElPagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :total="pagination.total"
              :page-sizes="[24, 48, 96, 192]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </template>

        <!-- 表格模式 -->
        <template v-else-if="viewMode === 'table'">
          <ArtTable
            ref="tableRef"
            table-layout="auto"
            :loading="loading"
            :data="imageList"
            :columns="tableColumns"
            :pagination="tablePagination"
            @selection-change="handleSelectionChange"
            @pagination:size-change="handleSizeChange"
            @pagination:current-change="handleCurrentChange"
            @row-click="(row: Api.Image.ImageItem) => !selectMode && handleImageClick(row)"
          />
        </template>
      </div>
    </ElCard>

    <!-- 图片上传弹窗 -->
    <ImageUploadDialog
      v-model:visible="uploadDialogVisible"
      :tag-options="tagOptions"
      :location-options="locationOptions"
      :edit-image-ids="singleEditImage ? [singleEditImage.id] : selectedImages"
      :edit-image-list="singleEditImage ? [singleEditImage] : selectedImageList"
      @success="handleUploadSuccess"
    />

    <!-- 图片预览对话框 -->
    <ElDialog v-model="previewVisible" title="图片预览" width="80%" top="5vh">
      <div v-if="previewImage" class="preview-content">
        <ElRow :gutter="20" class="flex-col md:flex-row">
          <!-- 图片区域 -->
          <ElCol :xs="24" :md="18" class="preview-image-col">
            <div class="preview-image-wrapper">
              <ElImage :src="previewImage.url" fit="contain" class="preview-image" />
            </div>
          </ElCol>
          <!-- 描述信息区域 -->
          <ElCol :xs="24" :md="6" class="preview-info-col">
            <ElDescriptions :column="1">
              <ElDescriptionsItem label="图片名称">{{ previewImage.name }}</ElDescriptionsItem>
              <ElDescriptionsItem label="文件大小">{{
                formatFileSize(previewImage.size)
              }}</ElDescriptionsItem>
              <ElDescriptionsItem label="图片格式">{{
                previewImage.format.toUpperCase()
              }}</ElDescriptionsItem>
              <ElDescriptionsItem label="尺寸" v-if="previewImage.width && previewImage.height">
                {{ previewImage.width }} × {{ previewImage.height }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="上传时间">{{
                previewImage.uploadTime
              }}</ElDescriptionsItem>
              <ElDescriptionsItem label="上传者">{{ previewImage.uploader }}</ElDescriptionsItem>
              <ElDescriptionsItem label="所有者">{{
                previewImage.ownerName || '-'
              }}</ElDescriptionsItem>
              <ElDescriptionsItem label="地点">{{
                previewImage.location || '-'
              }}</ElDescriptionsItem>
              <ElDescriptionsItem label="浏览量">{{ previewImage.views || 0 }}</ElDescriptionsItem>
              <ElDescriptionsItem label="标签">
                <span
                  v-if="previewImage.tags && previewImage.tags.length > 0"
                  class="inline-flex flex-wrap gap-2 items-center"
                >
                  <ElTag v-for="tag in previewImage.tags" :key="tag" type="primary" size="small">
                    {{ tag }}
                  </ElTag>
                </span>
                <span v-else class="text-g-400">无标签</span>
              </ElDescriptionsItem>
            </ElDescriptions>
          </ElCol>
        </ElRow>
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, h, computed, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import {
    ElMessage,
    ElMessageBox,
    ElDescriptions,
    ElDescriptionsItem,
    ElImage,
    ElTag,
    ElSegmented,
    ElPagination,
    ElEmpty,
    ElDivider,
    ElRow,
    ElCol,
    ElCheckbox
  } from 'element-plus'
  import { Upload, Loading, Delete, Picture, Edit, Check, ArrowLeft } from '@element-plus/icons-vue'
  import ArtImageCard from '@/components/core/cards/art-image-card/index.vue'
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import ArtTableHeader from '@/components/core/tables/art-table-header/index.vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ImageSearch from './modules/image-search.vue'
  import ImageUploadDialog from './modules/image-upload-dialog.vue'
  import { fetchGetImageList, fetchDeleteImage } from '@/api/image'
  import { useSourceStore } from '@/store/modules/source'
  import type { ColumnOption } from '@/types/component'

  defineOptions({ name: 'ImageUpload' })

  // 路由
  const route = useRoute()
  const router = useRouter()

  // 当前相册信息（从路由查询参数获取）
  const currentAlbumId = ref<number | null>(null)
  const currentAlbumName = ref<string | null>(null)

  // 从路由查询参数初始化相册信息
  const initAlbumInfo = () => {
    const albumId = route.query.albumId as string
    const albumName = route.query.albumName as string

    if (albumId) {
      currentAlbumId.value = parseInt(albumId, 10)
      currentAlbumName.value = albumName
    } else {
      currentAlbumId.value = null
      currentAlbumName.value = null
    }
  }

  // 返回相册页面
  const handleBackToAlbum = () => {
    router.back()
  }

  // 监听路由变化
  watch(
    () => route.query,
    () => {
      initAlbumInfo()
      // 如果相册ID变化，重新加载图片列表
      if (currentAlbumId.value) {
        loadImageList()
      }
    },
    { immediate: true }
  )

  // 资源管理 Store
  const sourceStore = useSourceStore()
  const viewMode = computed({
    get: () => sourceStore.viewMode,
    set: (value) => sourceStore.setViewMode(value)
  })

  // 搜索栏显示状态
  const showSearchBar = ref(false)

  // 搜索表单数据
  const searchForm = ref<Record<string, any>>({
    keyword: '',
    ownerId: undefined,
    tags: [],
    location: undefined,
    daterange: null
  })

  // 表格列配置（用于列显示控制）
  const columnChecks = ref<ColumnOption[]>([])

  // 上传弹窗显示状态
  const uploadDialogVisible = ref(false)

  // 标签选项（从已上传的图片中提取，也可以从后端获取）
  const tagOptions = ref<string[]>(['风景', '人物', '建筑', '动物', '美食', '夜景', '日景'])

  // 地点选项（目前为空，后续从地址管理获取）
  const locationOptions = ref<string[]>([])

  // 图片列表相关
  const loading = ref(false)
  const imageList = ref<Api.Image.ImageItem[]>([])

  // 表格引用（用于表格模式下的行选择操作）
  const tableRef = ref<InstanceType<typeof ArtTable> | null>(null)

  // 选择模式/查看模式
  const selectMode = ref(false)

  // 选择模式选项
  const selectModeOptions = [
    { label: '查看模式', value: 'view' },
    { label: '编辑模式', value: 'edit' }
  ]

  // 视图模式选项
  const viewModeOptions = [
    { label: '大图', value: 'large' },
    { label: '小图', value: 'small' },
    { label: '列表', value: 'table' }
  ]

  // 选中的图片ID列表
  const selectedImages = ref<number[]>([])

  // 选中的图片列表（用于编辑弹窗显示）
  const selectedImageList = computed(() => {
    return imageList.value.filter((image) => selectedImages.value.includes(image.id))
  })

  // 单个编辑的图片（不影响多选）
  const singleEditImage = ref<Api.Image.ImageItem | null>(null)

  // 分页相关
  const pagination = ref({
    page: 1,
    pageSize: 12,
    total: 0
  })

  // 表格模式分页
  const tablePagination = computed(() => ({
    current: pagination.value.page,
    size: pagination.value.pageSize,
    total: pagination.value.total
  }))

  // 表格列配置
  const tableColumns = computed<ColumnOption[]>(() => {
    const columns: ColumnOption[] = []
    // 只在编辑模式下显示复选框列
    if (selectMode.value) {
      columns.push({ type: 'selection', width: 55 })
    }
    columns.push(
      { type: 'index', width: 60, label: '序号' },
      {
        prop: 'image',
        label: '图片',
        width: 120,
        formatter: (row: Api.Image.ImageItem) => {
          return h(ElImage, {
            class: 'w-20 h-20 rounded cursor-pointer',
            src: row.url,
            fit: 'cover',
            preview: false,
            onClick: (e: Event) => {
              e.stopPropagation()
              if (selectMode.value) {
                // 编辑模式下，点击图片切换行的选中状态
                const isSelected = isImageSelected(row.id)
                tableRef.value?.elTableRef?.toggleRowSelection(row, !isSelected)
              } else {
                // 查看模式下，点击图片打开预览
                handleImageClick(row)
              }
            }
          })
        }
      },
      {
        prop: 'name',
        label: '图片名称',
        minWidth: 200,
        showOverflowTooltip: true
      },
      {
        prop: 'size',
        label: '文件大小',
        width: 120,
        formatter: (row: Api.Image.ImageItem) => formatFileSize(row.size)
      },
      {
        prop: 'format',
        label: '格式',
        width: 80,
        formatter: (row: Api.Image.ImageItem) => row.format.toUpperCase()
      },
      {
        prop: 'views',
        label: '浏览量',
        width: 100,
        formatter: (row: Api.Image.ImageItem) => row.views || 0
      },
      {
        prop: 'uploadTime',
        label: '上传时间',
        minWidth: 180
      },
      {
        prop: 'uploader',
        label: '上传者',
        width: 120
      },
      {
        prop: 'ownerName',
        label: '所有者',
        width: 120,
        formatter: (row: Api.Image.ImageItem) => row.ownerName || '-'
      },
      {
        prop: 'tags',
        label: '标签',
        minWidth: 150,
        formatter: (row: Api.Image.ImageItem) => {
          if (!row.tags || row.tags.length === 0) return '-'
          return h('div', { style: 'display: flex; flex-wrap: wrap; gap: 4px' }, [
            ...row.tags.map((tag) => h(ElTag, { type: 'primary', size: 'small' }, () => tag))
          ])
        }
      },
      {
        prop: 'location',
        label: '地点',
        width: 120,
        formatter: (row: Api.Image.ImageItem) => row.location || '-'
      }
    )
    if (selectMode.value) {
      columns.push({
        prop: 'operation',
        label: '操作',
        width: 180,
        fixed: 'right',
        formatter: (row: Api.Image.ImageItem) =>
          h('div', {}, [
            h(ArtButtonTable, {
              type: 'edit',
              show: selectMode.value,
              onClick: () => handleEdit(row)
            }),
            h(ArtButtonTable, {
              type: 'delete',
              show: selectMode.value,
              onClick: () => handleDelete(row)
            })
          ])
      })
    }
    return columns
  })

  // 预览相关
  const previewVisible = ref(false)
  const previewImage = ref<Api.Image.ImageItem | null>(null)

  // 加载图片列表
  const loadImageList = async () => {
    loading.value = true
    try {
      const params: Api.Image.ImageListParams = {
        page: pagination.value.page,
        pageSize: pagination.value.pageSize,
        keyword: searchForm.value.keyword || undefined,
        ownerId: searchForm.value.ownerId,
        tags:
          Array.isArray(searchForm.value.tags) && searchForm.value.tags.length > 0
            ? searchForm.value.tags.join(',')
            : undefined,
        location: searchForm.value.location,
        startTime:
          searchForm.value.daterange && Array.isArray(searchForm.value.daterange)
            ? searchForm.value.daterange[0]
            : undefined,
        endTime:
          searchForm.value.daterange && Array.isArray(searchForm.value.daterange)
            ? searchForm.value.daterange[1]
            : undefined,
        // 如果有相册ID，添加到查询参数（实际接口需要支持此参数）
        albumId: currentAlbumId.value || undefined
      }

      const response = await fetchGetImageList(params)
      imageList.value = response.list
      pagination.value.total = response.total

      // 更新标签选项（从返回的图片中提取标签）
      const allTags = new Set<string>()
      response.list.forEach((image) => {
        if (image.tags && image.tags.length > 0) {
          image.tags.forEach((tag) => allTags.add(tag))
        }
      })
      // 合并现有标签
      allTags.forEach((tag) => {
        if (!tagOptions.value.includes(tag)) {
          tagOptions.value.push(tag)
        }
      })
    } catch (error: any) {
      ElMessage.error(error.message || '加载图片列表失败')
    } finally {
      loading.value = false
    }
  }

  // 搜索
  const handleSearch = () => {
    pagination.value.page = 1
    loadImageList()
  }

  // 重置搜索参数
  const resetSearchParams = () => {
    searchForm.value = {
      keyword: '',
      ownerId: undefined,
      tags: [],
      location: undefined,
      daterange: null
    }
    handleSearch()
  }

  // 刷新数据
  const refreshData = () => {
    loadImageList()
  }

  // 打开上传弹窗
  const handleOpenUploadDialog = () => {
    uploadDialogVisible.value = true
  }

  // 上传成功回调（包括编辑成功）
  const handleUploadSuccess = () => {
    // 清空单个编辑图片
    singleEditImage.value = null
    // 注意：不清空 selectedImages，保持多选状态
    loadImageList()
  }

  // 模式切换
  const handleModeChange = (val: string | number) => {
    const mode = val as 'large' | 'small' | 'table'
    sourceStore.setViewMode(mode)
    // 根据模式调整分页大小
    if (mode === 'large') {
      pagination.value.pageSize = 12
    } else if (mode === 'small') {
      pagination.value.pageSize = 24
    } else {
      pagination.value.pageSize = 10
    }
    pagination.value.page = 1
    // 切换模式时清空多选数据（因为不同模式的分页大小不同）
    selectedImages.value = []
    loadImageList()
  }

  // 分页大小变化
  const handleSizeChange = (size: number) => {
    pagination.value.pageSize = size
    pagination.value.page = 1
    loadImageList()
  }

  // 分页页码变化
  const handleCurrentChange = (page: number) => {
    pagination.value.page = page
    loadImageList()
  }

  // 点击图片
  const handleImageClick = (image: Api.Image.ImageItem) => {
    previewImage.value = image
    previewVisible.value = true
  }

  // 编辑图片
  const handleEdit = (image: Api.Image.ImageItem) => {
    // 设置单个编辑图片，不影响多选数据
    singleEditImage.value = image
    uploadDialogVisible.value = true
  }

  // 删除图片
  const handleDelete = async (image: Api.Image.ImageItem) => {
    try {
      await ElMessageBox.confirm(`确定要删除图片 "${image.name}" 吗？`, '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })

      await fetchDeleteImage(image.id)
      ElMessage.success('删除成功')
      // 从选中列表中移除
      selectedImages.value = selectedImages.value.filter((id) => id !== image.id)
      await loadImageList()
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(error.message || '删除失败')
      }
    }
  }

  // 检查图片是否被选中
  const isImageSelected = (imageId: number) => {
    return selectedImages.value.includes(imageId)
  }

  // 切换图片选中状态（用于选择模式下的点击）
  const handleImageToggle = (imageId: number) => {
    if (isImageSelected(imageId)) {
      selectedImages.value = selectedImages.value.filter((id) => id !== imageId)
    } else {
      selectedImages.value.push(imageId)
    }
  }

  // 表格选择变化
  const handleSelectionChange = (selection: Api.Image.ImageItem[]) => {
    selectedImages.value = selection.map((item) => item.id)
  }

  // 是否全选
  const isAllSelected = computed({
    get: () => {
      if (imageList.value.length === 0) return false
      return imageList.value.every((image) => selectedImages.value.includes(image.id))
    },
    set: (val: boolean) => {
      if (val) {
        selectedImages.value = imageList.value.map((image) => image.id)
      } else {
        selectedImages.value = []
      }
    }
  })

  // 是否半选（部分选中）
  const isIndeterminate = computed(() => {
    const selectedCount = selectedImages.value.length
    return selectedCount > 0 && selectedCount < imageList.value.length
  })

  // 全选/取消全选
  const handleSelectAll = (val: boolean) => {
    if (val) {
      selectedImages.value = imageList.value.map((image) => image.id)
    } else {
      selectedImages.value = []
    }
  }

  // 批量编辑
  const handleBatchEdit = () => {
    if (selectedImages.value.length === 0) {
      ElMessage.warning('请先选择要编辑的图片')
      return
    }
    // 打开上传弹窗，用于编辑选中图片的元数据
    uploadDialogVisible.value = true
  }

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedImages.value.length === 0) {
      ElMessage.warning('请先选择要删除的图片')
      return
    }

    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedImages.value.length} 张图片吗？`,
        '提示',
        {
          type: 'warning',
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }
      )

      let successCount = 0
      let failCount = 0

      for (const imageId of selectedImages.value) {
        try {
          await fetchDeleteImage(imageId)
          successCount++
        } catch (error: any) {
          failCount++
          console.error(`删除图片失败: ${imageId}`, error)
        }
      }

      if (successCount > 0) {
        ElMessage.success(
          `成功删除 ${successCount} 张图片${failCount > 0 ? `，失败 ${failCount} 张` : ''}`
        )
        selectedImages.value = []
        await loadImageList()
      } else {
        ElMessage.error(`删除失败：${failCount} 张图片均删除失败`)
      }
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(error.message || '批量删除失败')
      }
    }
  }

  // 格式化日期
  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  // 初始化
  onMounted(() => {
    loadImageList()
  })
</script>

<style scoped lang="scss">
  :deep(.art-table-card) {
    display: flex;
    flex-direction: column;
    height: 100%;

    .el-card__body {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }
  }

  .table-header-fixed {
    flex-shrink: 0;
  }

  .table-content-scrollable {
    flex: 1;
    min-height: 0;
    overflow: hidden auto;
  }

  .image-grid {
    display: grid;
    gap: 20px;
  }

  .image-grid-large {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }

  .image-grid-small {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .image-item-wrapper {
    position: relative;
  }

  .image-item-small-wrapper {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: var(--el-border-radius-base);
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.02);
    }
  }

  .image-small {
    width: 100%;
    height: 100%;
    border-radius: var(--el-border-radius-base);
  }

  // 选择模式样式
  .image-item-wrapper.select-mode,
  .image-item-small-wrapper.select-mode {
    cursor: pointer;
    transition: all 0.3s ease;
  }

  // 选中状态的边框（使用outline避免圆角不贴合问题）
  :deep(.image-card-selected) {
    border-radius: calc(var(--custom-radius) + 4px);
    outline: 2px solid var(--el-color-primary);
    outline-offset: -2px;
  }

  .image-small-selected {
    border-radius: var(--el-border-radius-base);
    outline: 2px solid var(--el-color-primary);
    outline-offset: -2px;
  }

  // 大图选择模式蒙版
  .selection-overlay {
    position: absolute;
    inset: 0;
    z-index: 15;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgb(0 0 0 / 30%);
    border-radius: var(--el-border-radius-base);
    opacity: 0;
    transition: opacity 0.3s ease;

    .image-item-wrapper.select-mode:hover &,
    .image-item-wrapper.selected & {
      opacity: 1;
    }
  }

  .selection-check {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    color: white;
    background: var(--el-color-primary);
    border-radius: 50%;
    box-shadow: 0 2px 6px rgb(0 0 0 / 15%);

    &::before {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      content: '';
      background: rgb(255 255 255 / 20%);
      border-radius: 50%;
    }
  }

  .check-icon {
    position: relative;
    z-index: 1;
    font-size: 22px;
    font-weight: bold;
  }

  // 小图选择模式蒙版
  .selection-overlay-small {
    position: absolute;
    inset: 0;
    z-index: 15;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgb(0 0 0 / 30%);
    border-radius: var(--el-border-radius-base);
    opacity: 0;
    transition: opacity 0.3s ease;

    .image-item-small-wrapper.select-mode:hover &,
    .image-item-small-wrapper.selected & {
      opacity: 1;
    }
  }

  .selection-check-small {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    color: white;
    background: var(--el-color-primary);
    border-radius: 50%;
    box-shadow: 0 2px 6px rgb(0 0 0 / 15%);

    &::before {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      content: '';
      background: rgb(255 255 255 / 20%);
      border-radius: 50%;
    }
  }

  .check-icon-small {
    position: relative;
    z-index: 1;
    font-size: 22px;
    font-weight: bold;
  }

  // 大图模式操作按钮
  .image-card-actions {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 20;
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    transition: opacity 0.3s ease;
  }

  // 小图模式操作按钮
  .image-card-actions-small {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 20;
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    transition: opacity 0.3s ease;
  }

  .preview-image-col {
    display: flex;
    align-items: flex-start;
    justify-content: center;
  }

  .preview-image-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 70vh;
    overflow: auto;
  }

  .preview-image {
    width: auto;
    max-width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: var(--el-border-radius-base);
  }
</style>
