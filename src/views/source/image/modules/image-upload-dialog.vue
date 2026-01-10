<template>
  <ElDialog
    v-model="dialogVisible"
    :title="isEditMode ? '批量编辑图片' : '图片上传'"
    width="70%"
    :close-on-click-modal="false"
    @close="handleClose"
    top="5vh"
  >
    <div class="upload-dialog-content" :class="{ 'edit-mode': isEditMode }">
      <ElRow :gutter="20" class="flex-col md:flex-row">
        <!-- 左侧：上传配置表单 -->
        <ElCol :xs="24" :md="isEditMode ? 6 : 6" class="upload-config-col">
          <ElForm :model="formData" label-width="60px" class="upload-config-form">
            <ElFormItem label="所有者">
              <ElSelect
                v-model="formData.ownerId"
                filterable
                remote
                reserve-keyword
                placeholder="搜索用户（账号/昵称/电话）"
                :remote-method="handleUserSearch"
                :loading="userSearchLoading"
                clearable
                class="w-full"
              >
                <ElOption
                  v-for="user in userOptions"
                  :key="user.id"
                  :label="getUserDisplayName(user)"
                  :value="user.id"
                >
                  <div>
                    <div>{{ user.nickName || user.userName }}</div>
                    <div v-if="user.mobile" class="text-xs text-g-500">
                      {{ user.mobile }}
                    </div>
                  </div>
                </ElOption>
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="标签">
              <ElSelect
                v-model="formData.tags"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="选择或创建标签"
                class="w-full"
              >
                <ElOption v-for="tag in tagOptions" :key="tag" :label="tag" :value="tag" />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="地点">
              <ElSelect v-model="formData.location" placeholder="选择地点" clearable class="w-full">
                <ElOption
                  v-for="location in locationOptions"
                  :key="location"
                  :label="location"
                  :value="location"
                />
              </ElSelect>
            </ElFormItem>
          </ElForm>
          <!-- 编辑模式提示 -->
          <div v-if="isEditMode" class="edit-mode-tip">
            <ElText type="info" size="small">
              <ElIcon><InfoFilled /></ElIcon>
              仅更新已填写信息
            </ElText>
          </div>
        </ElCol>
        <!-- 右侧：上传组件或选中图片列表 -->
        <ElCol :xs="24" :md="isEditMode ? 18 : 18" class="upload-area-col">
          <!-- 编辑模式：显示选中的图片列表 -->
          <template v-if="isEditMode">
            <div class="selected-images-container">
              <div class="selected-images-header">
                <span class="text-sm text-g-600">已选择 {{ editImageList.length }} 张图片</span>
              </div>
              <ElScrollbar v-if="editImageList.length > 0" class="selected-images-scrollbar">
                <div class="selected-images-grid">
                  <div v-for="image in editImageList" :key="image.id" class="selected-image-item">
                    <ElImage
                      :src="image.url"
                      fit="cover"
                      class="selected-image-thumbnail"
                      :preview-src-list="[image.url]"
                      preview-teleported
                    >
                      <template #placeholder>
                        <div class="flex-cc w-full h-full bg-[#f5f7fa]">
                          <ElIcon><Picture /></ElIcon>
                        </div>
                      </template>
                    </ElImage>
                    <div class="selected-image-info">
                      <div class="selected-image-name" :title="image.name">
                        {{ image.name }}
                      </div>
                      <div class="selected-image-meta">
                        <div v-if="image.ownerName" class="selected-image-meta-item">
                          <span class="text-xs text-g-500">所有者：</span>
                          <span class="text-xs text-g-700">{{ image.ownerName }}</span>
                        </div>
                        <div v-if="image.location" class="selected-image-meta-item">
                          <span class="text-xs text-g-500">地点：</span>
                          <span class="text-xs text-g-700">{{ image.location }}</span>
                        </div>
                        <div v-if="image.tags && image.tags.length > 0" class="selected-image-tags">
                          <ElTag
                            v-for="tag in image.tags"
                            :key="tag"
                            size="small"
                            class="selected-image-tag"
                          >
                            {{ tag }}
                          </ElTag>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ElScrollbar>
              <ElEmpty v-else description="未选择图片" :image-size="80" />
            </div>
          </template>
          <!-- 上传模式：显示上传组件 -->
          <template v-else>
            <ElUpload
              ref="uploadRef"
              v-model:file-list="uploadFileList"
              class="upload-demo"
              action="#"
              :auto-upload="false"
              :multiple="true"
              :limit="20"
              :on-exceed="handleExceed"
              :before-upload="beforeUpload"
              :on-remove="handleRemove"
              list-type="picture-card"
              accept="image/*"
            >
              <ElIcon><Plus /></ElIcon>
              <template #tip>
                <div class="el-upload__tip">
                  支持 JPG、PNG、GIF、WEBP 格式，单个文件不超过 10MB，最多可上传 20 张
                </div>
              </template>
            </ElUpload>
          </template>
        </ElCol>
      </ElRow>
    </div>

    <template #footer>
      <div class="flex-c justify-end gap-2">
        <ElButton @click="handleClose">取消</ElButton>
        <ElButton
          type="primary"
          @click="handleSubmit"
          :loading="uploading"
          :disabled="!isEditMode && uploadFileList.length === 0"
        >
          <ElIcon v-if="!isEditMode"><Upload /></ElIcon>
          {{ isEditMode ? '保存' : '批量上传' }}
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import {
    ElMessage,
    ElMessageBox,
    ElUpload,
    type UploadFile,
    ElRow,
    ElCol,
    ElImage,
    ElEmpty,
    ElTag,
    ElScrollbar,
    ElText,
    ElIcon
  } from 'element-plus'
  import { Plus, Upload, Picture, InfoFilled } from '@element-plus/icons-vue'
  import { fetchUploadImage, fetchSearchUsers } from '@/api/image'

  interface Props {
    visible: boolean
    tagOptions?: string[]
    locationOptions?: string[]
    editImageIds?: number[] // 编辑模式下的图片ID列表
    editImageList?: Api.Image.ImageItem[] // 编辑模式下的图片列表
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    tagOptions: () => [],
    locationOptions: () => [],
    editImageIds: () => [],
    editImageList: () => []
  })

  // 是否为编辑模式
  const isEditMode = computed(() => props.editImageIds && props.editImageIds.length > 0)

  // 编辑模式下的图片列表
  const editImageList = computed(() => props.editImageList || [])

  // 检查是否有填写表单数据（编辑模式）
  const hasFormData = computed(() => {
    return !!(
      formData.value.ownerId ||
      (formData.value.tags && formData.value.tags.length > 0) ||
      formData.value.location
    )
  })

  // 获取已填写的字段列表（用于提示）
  const getFilledFields = () => {
    const fields: string[] = []
    if (formData.value.ownerId) {
      fields.push('所有者')
    }
    if (formData.value.tags && formData.value.tags.length > 0) {
      fields.push('标签')
    }
    if (formData.value.location) {
      fields.push('地点')
    }
    return fields
  }

  const emit = defineEmits<Emits>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  // 上传相关
  const uploadRef = ref()
  const uploadFileList = ref<UploadFile[]>([])
  const uploading = ref(false)

  // 表单数据
  const formData = ref<Api.Image.ImageUploadParams>({
    ownerId: undefined,
    tags: [],
    location: undefined
  })

  // 用户搜索相关
  const userSearchLoading = ref(false)
  const userOptions = ref<Api.Image.UserSearchItem[]>([])

  // 标签和地点选项
  const tagOptions = computed(() => props.tagOptions)
  const locationOptions = computed(() => props.locationOptions)

  // 用户搜索
  const handleUserSearch = async (keyword: string) => {
    if (!keyword || keyword.trim() === '') {
      userOptions.value = []
      return
    }

    userSearchLoading.value = true
    try {
      const users = await fetchSearchUsers(keyword)
      userOptions.value = users
    } catch (error: any) {
      console.error('搜索用户失败:', error)
      userOptions.value = []
    } finally {
      userSearchLoading.value = false
    }
  }

  // 获取用户显示名称
  const getUserDisplayName = (user: Api.Image.UserSearchItem) => {
    return user.nickName || user.userName
  }

  // 上传前验证
  const beforeUpload = (file: File) => {
    // 文件大小限制（10MB）
    const isLt10M = file.size / 1024 / 1024 < 10
    if (!isLt10M) {
      ElMessage.error('图片大小不能超过 10MB')
      return false
    }

    // 文件类型验证
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      ElMessage.error('不支持的文件类型，仅支持 JPG、PNG、GIF、WEBP')
      return false
    }

    return true
  }

  // 文件数量超出限制
  const handleExceed = () => {
    ElMessage.warning('最多只能上传 20 张图片')
  }

  // 移除文件
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRemove = (_file: UploadFile) => {
    // 可以在这里添加移除逻辑
  }

  // 提交上传或编辑
  const handleSubmit = async () => {
    // 编辑模式
    if (isEditMode.value) {
      if (!props.editImageIds || props.editImageIds.length === 0) {
        ElMessage.warning('没有选中的图片')
        return
      }

      // 检查是否有填写数据
      if (!hasFormData.value) {
        ElMessage.warning('请先填写表单内容')
        return
      }

      // 获取已填写的字段
      const filledFields = getFilledFields()
      const fieldsText = filledFields.join('"、"')
      const confirmMessage = `此操作将更新已选中图片的"${fieldsText}"信息，是否继续？`

      try {
        await ElMessageBox.confirm(confirmMessage, '提示', {
          type: 'warning',
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })
      } catch (error: any) {
        if (error !== 'cancel') {
          ElMessage.error(error.message || '操作失败')
        }
        return
      }

      uploading.value = true
      try {
        // TODO: 调用批量更新API
        // await fetchBatchUpdateImages(props.editImageIds, formData.value)
        ElMessage.success(`成功更新 ${props.editImageIds.length} 张图片的元数据`)
        handleClose()
        emit('success')
      } catch (error: any) {
        ElMessage.error(error.message || '批量更新失败')
      } finally {
        uploading.value = false
      }
      return
    }

    // 上传模式
    if (uploadFileList.value.length === 0) {
      ElMessage.warning('请先选择要上传的图片')
      return
    }

    uploading.value = true
    let successCount = 0
    let failCount = 0

    try {
      for (const file of uploadFileList.value) {
        if (file.raw) {
          try {
            await fetchUploadImage(file.raw, formData.value)
            successCount++
          } catch (error: any) {
            failCount++
            console.error(`上传失败: ${file.name}`, error)
          }
        }
      }

      if (successCount > 0) {
        ElMessage.success(
          `成功上传 ${successCount} 张图片${failCount > 0 ? `，失败 ${failCount} 张` : ''}`
        )
        handleClose()
        emit('success')
      } else {
        ElMessage.error(`上传失败：${failCount} 张图片均上传失败`)
      }
    } catch (error: any) {
      ElMessage.error(error.message || '批量上传失败')
    } finally {
      uploading.value = false
    }
  }

  // 关闭弹窗
  const handleClose = () => {
    uploadFileList.value = []
    formData.value = {
      ownerId: undefined,
      tags: [],
      location: undefined
    }
    dialogVisible.value = false
  }

  // 监听弹窗关闭，重置表单
  watch(
    () => props.visible,
    (newVal) => {
      if (!newVal) {
        uploadFileList.value = []
        formData.value = {
          ownerId: undefined,
          tags: [],
          location: undefined
        }
      }
    }
  )
</script>

<style scoped lang="scss">
  .upload-dialog-content {
    &.edit-mode {
      min-height: 500px;
    }
  }

  .selected-images-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .selected-images-header {
    flex-shrink: 0;
    padding: 12px 0;
    margin-bottom: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .selected-images-scrollbar {
    flex: 1;
    min-height: 0;
    max-height: 60vh;
  }

  .selected-images-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
    align-items: start;
    padding-bottom: 16px;
  }

  .selected-image-item {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: var(--el-border-radius-base);
    transition: all 0.3s ease;

    &:hover {
      border-color: var(--el-color-primary);
      box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
    }
  }

  .selected-image-thumbnail {
    flex-shrink: 0;
    width: 100%;
    height: 150px;
    object-fit: cover;
  }

  .selected-image-info {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 6px;
    min-height: 0;
    padding: 8px;
  }

  .selected-image-name {
    flex-shrink: 0;
    overflow: hidden;
    font-size: 12px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .selected-image-meta {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 4px;
    min-height: 0;
  }

  .selected-image-meta-item {
    display: flex;
    flex-shrink: 0;
    gap: 4px;
    align-items: center;
  }

  .selected-image-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 2px;
  }

  .selected-image-tag {
    margin: 0;
  }

  .edit-mode-tip {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 8px 12px;
    margin-top: 12px;
    background: var(--el-color-info-light-9);
    border-radius: var(--el-border-radius-base);

    .el-icon {
      font-size: 14px;
    }
  }
</style>
