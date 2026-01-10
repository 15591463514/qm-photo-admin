<!-- 图片管理页面 -->
<template>
  <div class="image-page art-full-height">
    <!-- 搜索栏 -->
    <ImageSearch
      v-show="showSearchBar"
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    />

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader
        v-model:columns="columnChecks"
        v-model:showSearchBar="showSearchBar"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <!-- 上传按钮 -->
          <div class="flex-c gap-4">
            <!-- 选择/查看模式切换 -->
            <ElRadioGroup v-model="selectMode" size="default">
              <ElRadioButton :label="false">查看模式</ElRadioButton>
              <ElRadioButton :label="true">编辑模式</ElRadioButton>
            </ElRadioGroup>
            <!-- 视图模式切换 -->
            <ElRadioGroup
              :model-value="viewMode"
              size="default"
              :disabled="selectMode"
              @change="handleModeChange as any"
            >
              <ElRadioButton label="large">大图</ElRadioButton>
              <ElRadioButton label="small">小图</ElRadioButton>
              <ElRadioButton label="table">列表</ElRadioButton>
            </ElRadioGroup>
            <ElButton v-if="!selectMode" type="primary" @click="handleOpenUploadDialog">
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
                :date="formatDate(image.uploadTime)"
                :class="{
                  'pointer-events-none': selectMode,
                  'image-card-selected': selectMode && isImageSelected(image.id)
                }"
              />
              <div
                v-if="!selectMode"
                class="delete-btn-wrapper absolute top-2 right-2 flex-c gap-2 z-10"
              >
                <ElButton type="danger" size="small" circle @click.stop="handleDelete(image)">
                  <ElIcon><Delete /></ElIcon>
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
              <div v-if="!selectMode" class="delete-btn-wrapper-small absolute top-1 right-1 z-10">
                <ElButton type="danger" size="small" circle @click.stop="handleDelete(image)">
                  <ElIcon><Delete /></ElIcon>
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
            table-layout="auto"
            :loading="loading"
            :data="imageList"
            :columns="tableColumns"
            :pagination="tablePagination"
            @selection-change="handleSelectionChange"
            @pagination:size-change="handleSizeChange"
            @pagination:current-change="handleCurrentChange"
          />
        </template>
      </div>
    </ElCard>

    <!-- 图片上传弹窗 -->
    <ImageUploadDialog
      v-model:visible="uploadDialogVisible"
      :tag-options="tagOptions"
      :location-options="locationOptions"
      :edit-image-ids="selectedImages"
      :edit-image-list="selectedImageList"
      @success="handleUploadSuccess"
    />

    <!-- 图片预览对话框 -->
    <ElDialog v-model="previewVisible" title="图片预览" width="80%" top="10vh">
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
  import { ref, onMounted, h, computed } from 'vue'
  import {
    ElMessage,
    ElMessageBox,
    ElDescriptions,
    ElDescriptionsItem,
    ElImage,
    ElTag,
    ElRadioGroup,
    ElRadioButton,
    ElPagination,
    ElEmpty,
    ElRow,
    ElCol,
    ElCheckbox
  } from 'element-plus'
  import { Upload, Loading, Delete, Picture, Edit, Check } from '@element-plus/icons-vue'
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

  // 资源管理 Store
  const sourceStore = useSourceStore()
  const viewMode = computed({
    get: () => sourceStore.viewMode,
    set: (value) => sourceStore.setViewMode(value)
  })

  // 搜索栏显示状态
  const showSearchBar = ref(true)

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

  // 选择模式/查看模式
  const selectMode = ref(false)

  // 选中的图片ID列表
  const selectedImages = ref<number[]>([])

  // 选中的图片列表（用于编辑弹窗显示）
  const selectedImageList = computed(() => {
    return imageList.value.filter((image) => selectedImages.value.includes(image.id))
  })

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
    // 选择模式下显示selection列
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
            class: 'w-20 h-20 rounded',
            src: row.url,
            fit: 'cover',
            previewSrcList: [row.url],
            previewTeleported: true
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
      },
      {
        prop: 'operation',
        label: '操作',
        width: 120,
        fixed: 'right',
        formatter: (row: Api.Image.ImageItem) =>
          h('div', [
            h(ArtButtonTable, {
              type: 'delete',
              show: true,
              onClick: () => handleDelete(row)
            })
          ])
      }
    )
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
            : undefined
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
    // 清空选中项
    selectedImages.value = []
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

  // 监听选择模式切换，切换时清空选中项
  watch(selectMode, (newVal) => {
    if (!newVal) {
      selectedImages.value = []
    }
  })

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
  .image-page {
    padding: 20px;
  }

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

    &:hover {
      .delete-btn-wrapper {
        opacity: 1;
      }
    }
  }

  .delete-btn-wrapper {
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .image-item-small-wrapper {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: var(--el-border-radius-base);
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);

      .delete-btn-wrapper-small {
        opacity: 1;
      }
    }
  }

  .delete-btn-wrapper-small {
    opacity: 0;
    transition: opacity 0.2s ease;
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

    &:hover {
      transform: scale(1.02);
    }
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
    width: 48px;
    height: 48px;
    color: white;
    background: var(--el-color-primary);
    border-radius: 50%;
    box-shadow: 0 2px 8px rgb(0 0 0 / 15%);

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
    font-size: 28px;
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
