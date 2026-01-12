<!-- 相册管理页面 -->
<template>
  <div class="album-page art-full-height">
    <!-- 搜索栏 -->
    <AlbumSearch
      v-show="showSearchBar"
      v-model="searchForm"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard
      class="art-table-card"
      shadow="never"
      :style="{ 'margin-top': showSearchBar ? '12px' : '0' }"
    >
      <!-- 表格头部 -->
      <ArtTableHeader
        :showZebra="false"
        :loading="loading"
        v-model:columns="columnChecks"
        v-model:showSearchBar="showSearchBar"
        @refresh="handleRefresh"
      >
        <template #left>
          <div class="flex-c gap-3">
            <!-- 查看/编辑模式切换 -->
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
            <ElButton v-if="!selectMode" type="primary" plain v-ripple @click="handleAdd">
              新增相册
            </ElButton>

            <!-- 选择模式：显示全选和批量操作按钮 -->
            <div v-if="selectMode" class="flex-c">
              <!-- 卡片模式显示全选 -->
              <ElCheckbox
                v-if="viewMode === 'card'"
                v-model="isAllSelected"
                :indeterminate="isIndeterminate"
                @change="(val: any) => handleSelectAll(!!val)"
                class="ml-4"
              >
                全选
              </ElCheckbox>
              <ElButton
                type="success"
                plain
                @click="handleBatchToggleStatus(StatusEnum.ENABLED)"
                :disabled="loading || selectedAlbums.length === 0"
                class="ml-4"
              >
                批量启用 ({{ selectedAlbums.length }})
              </ElButton>
              <ElButton
                type="warning"
                plain
                @click="handleBatchToggleStatus(StatusEnum.DISABLED)"
                :disabled="loading || selectedAlbums.length === 0"
                class="ml-2"
              >
                批量禁用 ({{ selectedAlbums.length }})
              </ElButton>
              <ElButton
                type="danger"
                plain
                @click="handleBatchDelete"
                :disabled="loading || selectedAlbums.length === 0"
                class="ml-2"
              >
                批量删除 ({{ selectedAlbums.length }})
              </ElButton>
            </div>
          </div>
        </template>
      </ArtTableHeader>

      <!-- 相册内容区域 -->
      <div class="album-content-scrollable mt-4">
        <!-- 加载状态 -->
        <div v-if="loading" class="flex-cc py-20">
          <ElIcon class="is-loading text-4xl text-g-400"><Loading /></ElIcon>
        </div>

        <!-- 空状态 -->
        <ElEmpty v-else-if="albumList.length === 0" description="暂无相册数据" />

        <!-- 相册卡片列表 -->
        <div v-else-if="viewMode === 'card'" class="album-grid">
          <div
            v-for="album in albumList"
            :key="album.id"
            class="album-card"
            :class="{
              'select-mode': selectMode,
              selected: selectMode && isAlbumSelected(album.id)
            }"
            @click="selectMode ? handleToggleSelect(album.id) : handleAlbumClick(album)"
          >
            <!-- 选择模式：显示选中蒙版和勾选图标 -->
            <div v-if="selectMode" class="selection-overlay">
              <div v-if="isAlbumSelected(album.id)" class="selection-check">
                <ElIcon class="check-icon"><Check /></ElIcon>
              </div>
            </div>
            <ArtImageCard
              :image-url="album.coverImage || 'https://via.placeholder.com/400x300?text=No+Cover'"
              :title="album.name"
              :views="album.views"
              :category="album.tags.map((tag) => tag.label)"
              :date="formatDate(album.createTime)"
              :class="{
                'pointer-events-none': selectMode,
                'image-card-selected': selectMode && isAlbumSelected(album.id)
              }"
            />
            <!-- 编辑模式：显示操作按钮 -->
            <div class="album-card-actions" @click.stop>
              <!-- v-auth="'album:edit'" -->
              <ElButton
                type="primary"
                link
                size="small"
                :style="{
                  opacity: selectMode ? 1 : 0,
                  pointerEvents: selectMode ? 'auto' : 'none'
                }"
                @click="handleEdit(album)"
              >
                编辑
              </ElButton>
              <!-- v-auth="'album:delete'" -->
              <ElButton
                type="danger"
                link
                size="small"
                :style="{
                  opacity: selectMode ? 1 : 0,
                  pointerEvents: selectMode ? 'auto' : 'none'
                }"
                @click="handleDelete(album)"
              >
                删除
              </ElButton>
            </div>
          </div>
        </div>

        <!-- 表格模式 -->
        <ArtTable
          v-else-if="viewMode === 'table'"
          table-layout="auto"
          :loading="loading"
          :data="albumList"
          :columns="tableColumns"
          :pagination="tablePagination"
          @selection-change="handleSelectionChange"
          @pagination:size-change="handleSizeChange"
          @pagination:current-change="handleCurrentChange"
        />
      </div>

      <!-- 分页 -->
      <div v-if="!loading && albumList.length > 0" class="pagination-container mt-4">
        <ElPagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[12, 24, 48, 96]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- 相册弹窗 -->
      <AlbumDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :edit-data="editData"
        :address-options="addressOptions"
        :tag-options="tagOptions"
        @submit="handleSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, h } from 'vue'
  import { ElMessage, ElMessageBox, ElSegmented, ElCheckbox } from 'element-plus'
  import { Loading, Check } from '@element-plus/icons-vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import ArtImageCard from '@/components/core/cards/art-image-card/index.vue'
  import AlbumSearch from './modules/album-search.vue'
  import AlbumDialog from './modules/album-dialog.vue'
  import {
    fetchGetAlbumList,
    fetchCreateAlbum,
    fetchUpdateAlbum,
    fetchDeleteAlbum,
    fetchBatchDeleteAlbum,
    fetchBatchToggleAlbumStatus
  } from '@/api/album'
  import { DialogType } from '@/types'
  import { StatusEnum } from '@/constants/enums'
  import { useRouter } from 'vue-router'
  import { watch } from 'vue'
  // import { useAuth } from '@/hooks/core/useAuth'
  import { STATUS_SWITCH_CONFIG } from '@/constants/components'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'

  defineOptions({ name: 'Album' })

  const router = useRouter()
  // const { hasAuth } = useAuth()

  // 状态管理
  const loading = ref(false)
  const showSearchBar = ref(false)
  const selectMode = ref(false) // 选择模式/查看模式
  const viewMode = ref<'card' | 'table'>('card') // 视图模式
  const selectedAlbums = ref<number[]>([])
  const albumList = ref<Api.Album.AlbumItem[]>([])

  // 分页
  const pagination = ref({
    current: 1,
    size: 12,
    total: 0
  })

  // 搜索表单
  const searchForm = ref<Api.Album.AlbumListParams>({
    keyword: undefined,
    status: undefined
  })

  // 弹窗相关
  const dialogVisible = ref(false)
  const dialogType = ref<DialogType>('add')
  const editData = ref<Api.Album.AlbumItem | null>(null)

  // 地址和标签选项（从 mock 数据中获取，实际应该从 API 获取）
  const addressOptions = ref<Array<{ id: number; name: string }>>([
    { id: 1, name: '公司总部' },
    { id: 2, name: '上海分公司' },
    { id: 3, name: '深圳分公司' }
  ])

  const tagOptions = ref<Array<{ id: number; label: string; value: string }>>([
    { id: 1, label: '风景', value: 'landscape' },
    { id: 2, label: '自然', value: 'nature' },
    { id: 3, label: '户外', value: 'outdoor' },
    { id: 4, label: '建筑', value: 'architecture' },
    { id: 5, label: '城市', value: 'city' },
    { id: 6, label: '人物', value: 'portrait' },
    { id: 7, label: '艺术', value: 'art' },
    { id: 8, label: '美食', value: 'food' },
    { id: 9, label: '生活', value: 'life' },
    { id: 10, label: '旅行', value: 'travel' },
    { id: 11, label: '记录', value: 'record' },
    { id: 12, label: '动物', value: 'animal' }
  ])

  // 选择模式选项
  const selectModeOptions = [
    { label: '查看模式', value: 'view' },
    { label: '编辑模式', value: 'edit' }
  ]

  // 视图模式选项
  const viewModeOptions = [
    { label: '卡片', value: 'card' },
    { label: '列表', value: 'table' }
  ]

  // 表格列配置
  const { columnChecks } = useTableColumns(() => [])

  // 表格列配置
  const tableColumns = computed(() => [
    { type: 'selection' as const },
    { type: 'index' as const, width: 60, label: '序号' },
    {
      prop: 'name',
      label: '相册名称',
      minWidth: 150,
      showOverflowTooltip: true
    },
    {
      prop: 'description',
      label: '描述',
      minWidth: 200,
      showOverflowTooltip: true,
      formatter: (row: Api.Album.AlbumItem) => row.description || '-'
    },
    {
      prop: 'imageCount',
      label: '图片数量',
      width: 100,
      formatter: (row: Api.Album.AlbumItem) => row.imageCount || 0
    },
    {
      prop: 'views',
      label: '浏览量',
      width: 100,
      formatter: (row: Api.Album.AlbumItem) => row.views || 0
    },
    {
      prop: 'addressName',
      label: '关联地址',
      minWidth: 120,
      formatter: (row: Api.Album.AlbumItem) => row.addressName || '-'
    },
    {
      prop: 'status',
      label: '状态',
      width: 100,
      formatter: (row: Api.Album.AlbumItem & { _statusLoading?: boolean }) => {
        return h(ElSwitch, {
          modelValue: row.status === StatusEnum.ENABLED,
          loading: row._statusLoading || false,
          ...STATUS_SWITCH_CONFIG,
          onChange: (value) => {
            handleToggleStatus(row, value as boolean)
          }
        })
      }
    },
    {
      prop: 'createTime',
      label: '创建时间',
      width: 180
    },
    {
      prop: 'operation',
      label: '操作',
      width: selectMode.value ? 180 : 80,
      fixed: 'right' as const,
      formatter: (row: Api.Album.AlbumItem) =>
        h('div', {}, [
          h(ArtButtonTable, {
            type: 'view',
            icon: 'ri:image-add-line',
            show: true,
            tooltipContent: '进入相册',
            onClick: () => handleAlbumClick(row)
          }),
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
    }
  ])

  // 表格分页
  const tablePagination = computed(() => ({
    current: pagination.value.current,
    size: pagination.value.size,
    total: pagination.value.total
  }))

  // 判断相册是否被选中
  const isAlbumSelected = (albumId: number) => {
    return selectedAlbums.value.includes(albumId)
  }

  // 切换相册选中状态
  const handleToggleSelect = (albumId: number) => {
    if (isAlbumSelected(albumId)) {
      selectedAlbums.value = selectedAlbums.value.filter((id) => id !== albumId)
    } else {
      selectedAlbums.value.push(albumId)
    }
  }

  // 是否全选
  const isAllSelected = computed({
    get: () => {
      if (albumList.value.length === 0) return false
      return albumList.value.every((album) => selectedAlbums.value.includes(album.id))
    },
    set: (val: boolean) => {
      if (val) {
        selectedAlbums.value = albumList.value.map((album) => album.id)
      } else {
        selectedAlbums.value = []
      }
    }
  })

  // 是否半选（部分选中）
  const isIndeterminate = computed(() => {
    const selectedCount = selectedAlbums.value.length
    return selectedCount > 0 && selectedCount < albumList.value.length
  })

  // 全选/取消全选
  const handleSelectAll = (val: boolean) => {
    if (val) {
      selectedAlbums.value = albumList.value.map((album) => album.id)
    } else {
      selectedAlbums.value = []
    }
  }

  // 模式切换
  const handleModeChange = (val: string | number) => {
    const mode = val as 'card' | 'table'
    viewMode.value = mode
    // 根据模式调整分页大小
    if (mode === 'card') {
      pagination.value.size = 12
    } else {
      pagination.value.size = 10
    }
    pagination.value.current = 1
    loadAlbumList()
  }

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedAlbums.value.length === 0) {
      ElMessage.warning('请先选择要删除的相册')
      return
    }

    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedAlbums.value.length} 个相册吗？`,
        '提示',
        {
          type: 'warning'
        }
      )

      await fetchBatchDeleteAlbum(selectedAlbums.value)
      ElMessage.success('批量删除成功')
      selectedAlbums.value = []
      loadAlbumList()
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(error.message || '批量删除失败')
      }
    }
  }

  // 表格选择变化
  const handleSelectionChange = (selection: Api.Album.AlbumItem[]) => {
    selectedAlbums.value = selection.map((item) => item.id)
  }

  // 切换单个相册状态
  const handleToggleStatus = async (album: Api.Album.AlbumItem, enabled: boolean) => {
    // 设置加载状态
    if (!(album as any)._statusLoading) {
      ;(album as any)._statusLoading = true
    }

    try {
      const newStatus = enabled ? StatusEnum.ENABLED : StatusEnum.DISABLED
      await fetchBatchToggleAlbumStatus([album.id], newStatus)
      ElMessage.success(enabled ? '已启用' : '已禁用')
      // 更新本地数据
      album.status = newStatus
      // 刷新数据
      loadAlbumList()
    } catch (error: any) {
      ElMessage.error(error.message || '状态切换失败')
      // 刷新数据以恢复原状态
      loadAlbumList()
    } finally {
      ;(album as any)._statusLoading = false
    }
  }

  // 相册点击（进入图片管理）
  const handleAlbumClick = (album: Api.Album.AlbumItem) => {
    router.push({
      name: 'ImageManage',
      query: {
        albumId: album.id,
        albumName: album.name
      }
    })
  }

  // 加载相册列表
  const loadAlbumList = async () => {
    loading.value = true
    try {
      const params: Api.Album.AlbumListParams = {
        current: pagination.value.current,
        size: pagination.value.size,
        keyword: searchForm.value.keyword || undefined,
        status: searchForm.value.status
      }

      const result = await fetchGetAlbumList(params)
      albumList.value = result.records || []
      pagination.value.total = result.total || 0
    } catch (error: any) {
      ElMessage.error(error.message || '加载相册列表失败')
    } finally {
      loading.value = false
    }
  }

  // 搜索
  const handleSearch = () => {
    pagination.value.current = 1
    loadAlbumList()
  }

  // 重置搜索
  const handleReset = () => {
    searchForm.value = {
      keyword: undefined,
      status: undefined
    }
    pagination.value.current = 1
    loadAlbumList()
  }

  // 刷新
  const handleRefresh = () => {
    loadAlbumList()
  }

  // 分页大小变化
  const handleSizeChange = (size: number) => {
    pagination.value.size = size
    pagination.value.current = 1
    loadAlbumList()
  }

  // 当前页变化
  const handleCurrentChange = (current: number) => {
    pagination.value.current = current
    loadAlbumList()
  }

  // 新增
  const handleAdd = () => {
    dialogType.value = 'add'
    editData.value = null
    dialogVisible.value = true
  }

  // 编辑
  const handleEdit = (album: Api.Album.AlbumItem) => {
    dialogType.value = 'edit'
    editData.value = album
    dialogVisible.value = true
  }

  // 删除
  const handleDelete = async (album: Api.Album.AlbumItem) => {
    try {
      await ElMessageBox.confirm(`确定要删除相册"${album.name}"吗？`, '提示', {
        type: 'warning'
      })

      await fetchDeleteAlbum(album.id)
      ElMessage.success('删除成功')
      loadAlbumList()
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(error.message || '删除失败')
      }
    }
  }

  // 批量切换状态
  const handleBatchToggleStatus = async (status: number) => {
    if (selectedAlbums.value.length === 0) {
      ElMessage.warning('请选择要操作的相册')
      return
    }

    try {
      const statusText = status === StatusEnum.ENABLED ? '启用' : '禁用'
      await ElMessageBox.confirm(
        `确定要${statusText}选中的 ${selectedAlbums.value.length} 个相册吗？`,
        '提示',
        {
          type: 'warning'
        }
      )

      await fetchBatchToggleAlbumStatus(selectedAlbums.value, status)
      ElMessage.success(`批量${statusText}成功`)
      selectedAlbums.value = []
      loadAlbumList()
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(
          error.message || `批量${status === StatusEnum.ENABLED ? '启用' : '禁用'}失败`
        )
      }
    }
  }

  // 提交表单（新增/编辑）
  const handleSubmit = async (data: Api.Album.CreateAlbumParams | Api.Album.UpdateAlbumParams) => {
    try {
      if (dialogType.value === 'add') {
        await fetchCreateAlbum(data as Api.Album.CreateAlbumParams)
        ElMessage.success('新增成功')
      } else {
        await fetchUpdateAlbum(data as Api.Album.UpdateAlbumParams)
        ElMessage.success('编辑成功')
      }
      dialogVisible.value = false
      loadAlbumList()
    } catch (error: any) {
      ElMessage.error(error.message || `${dialogType.value === 'add' ? '新增' : '编辑'}失败`)
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

  // 监听选择模式切换，切换时清空选中项
  watch(selectMode, (newVal) => {
    if (!newVal) {
      selectedAlbums.value = []
    }
  })

  watch(viewMode, () => {
    selectedAlbums.value = []
  })

  // 初始化
  onMounted(() => {
    loadAlbumList()
  })
</script>

<style scoped lang="scss">
  .album-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .album-content-scrollable {
    flex: 1;
    min-height: 0;
    overflow: hidden auto;
  }

  .album-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    padding: 0;
  }

  .album-card {
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
    }

    :deep(.art-card) {
      width: 100%;
    }
  }

  // 选择模式样式
  .album-card.select-mode,
  .album-card.selected {
    cursor: pointer;
    transition: all 0.3s ease;
  }

  // 选中状态的边框（使用outline避免圆角不贴合问题）
  :deep(.image-card-selected) {
    border-radius: calc(var(--custom-radius) + 4px);
    outline: 2px solid var(--el-color-primary);
    outline-offset: -2px;
  }

  // 卡片选择模式蒙版
  .selection-overlay {
    position: absolute;
    inset: 0;
    z-index: 15;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    background: rgb(0 0 0 / 30%);
    border-radius: var(--el-border-radius-base);
    opacity: 0;
    transition: opacity 0.3s ease;

    .album-card.select-mode:hover &,
    .album-card.selected & {
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

    .check-icon {
      position: relative;
      z-index: 1;
      font-size: 22px;
      font-weight: bold;
    }
  }

  .album-card-actions {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 20;
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    transition: opacity 0.3s ease;
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    padding: 16px 0;
  }
</style>
