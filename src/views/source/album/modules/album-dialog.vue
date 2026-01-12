<!-- 相册对话框组件 -->
<template>
  <ElDialog
    v-model="visible"
    :title="props.type === 'add' ? '新增相册' : '编辑相册'"
    width="600px"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="相册名称" prop="name">
        <ElInput
          v-model="formData.name"
          placeholder="请输入相册名称"
          maxlength="100"
          show-word-limit
        />
      </ElFormItem>

      <ElFormItem label="封面图片" prop="coverImage">
        <ElUpload
          ref="uploadRef"
          v-model:file-list="uploadFileList"
          :auto-upload="false"
          :limit="1"
          :on-exceed="handleExceed"
          :before-upload="beforeUpload"
          :on-remove="handleRemove"
          :on-change="handleChange"
          list-type="picture-card"
          accept="image/*"
        >
          <ElIcon><Plus /></ElIcon>
          <template #tip>
            <div class="el-upload__tip"
              >支持 JPG、PNG、GIF、WEBP 格式，图片大小不超过 20MB，最多选择1张图片</div
            >
          </template>
        </ElUpload>
      </ElFormItem>

      <ElFormItem label="关联地址" prop="addressId">
        <ElSelect
          v-model="formData.addressId"
          filterable
          clearable
          placeholder="请选择地址"
          style="width: 100%"
        >
          <ElOption
            v-for="address in addressOptions"
            :key="address.id"
            :label="address.name"
            :value="address.id"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="描述" prop="description">
        <ElInput
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入描述"
          maxlength="500"
          show-word-limit
        />
      </ElFormItem>

      <ElFormItem label="标签" prop="tagIds">
        <ElSelect
          v-model="formData.tagIds"
          multiple
          :multiple-limit="6"
          filterable
          clearable
          placeholder="请选择标签（最多6个）"
          style="width: 100%"
        >
          <ElOption v-for="tag in tagOptions" :key="tag.id" :label="tag.label" :value="tag.id" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="状态" prop="status">
        <ElRadioGroup v-model="formData.status">
          <ElRadio :label="StatusEnum.ENABLED">启用</ElRadio>
          <ElRadio :label="StatusEnum.DISABLED">禁用</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="flex-c justify-end gap-2">
        <ElButton @click="handleCancel">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit" :loading="submitting">
          {{ props.type === 'add' ? '新增' : '保存' }}
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { ElMessage, ElUpload, type UploadFile } from 'element-plus'
  import { Plus } from '@element-plus/icons-vue'
  import { StatusEnum } from '@/constants/enums'

  defineOptions({ name: 'AlbumDialog' })

  interface Props {
    visible: boolean
    type: 'add' | 'edit'
    editData?: Api.Album.AlbumItem | null
    addressOptions?: Array<{ id: number; name: string }>
    tagOptions?: Array<{ id: number; label: string; value: string }>
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', data: Api.Album.CreateAlbumParams | Api.Album.UpdateAlbumParams): void
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    type: 'add',
    editData: null,
    addressOptions: () => [],
    tagOptions: () => []
  })

  const emit = defineEmits<Emits>()

  const visible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const formRef = ref()
  const uploadRef = ref()
  const submitting = ref(false)
  const uploadFileList = ref<UploadFile[]>([])

  // 表单数据
  const formData = ref<{
    name: string
    coverImage?: string
    addressId?: number
    description?: string
    tagIds?: number[]
    status: number
  }>({
    name: '',
    coverImage: undefined,
    addressId: undefined,
    description: '',
    tagIds: [],
    status: StatusEnum.ENABLED
  })

  // 表单验证规则
  const rules = {
    name: [{ required: true, message: '请输入相册名称', trigger: 'blur' }]
  }

  // 上传前验证
  const beforeUpload = (file: File) => {
    const isLt10M = file.size / 1024 / 1024 < 10
    if (!isLt10M) {
      ElMessage.error('图片大小不能超过 10MB')
      return false
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      ElMessage.error('不支持的文件类型，仅支持 JPG、PNG、GIF、WEBP')
      return false
    }

    return true
  }

  // 文件数量超出限制
  const handleExceed = () => {
    ElMessage.warning('只能上传一张封面图片')
  }

  // 文件变化
  const handleChange = (file: UploadFile) => {
    if (file.raw) {
      // 这里可以预览图片，实际项目中需要上传到服务器获取URL
      const reader = new FileReader()
      reader.onload = (e) => {
        formData.value.coverImage = e.target?.result as string
      }
      reader.readAsDataURL(file.raw)
    } else if (file.url) {
      // 如果是已有图片（编辑模式回显），直接使用URL
      formData.value.coverImage = file.url
    }
  }

  // 移除文件
  const handleRemove = () => {
    formData.value.coverImage = undefined
    uploadFileList.value = []
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()

      const submitData: Api.Album.CreateAlbumParams | Api.Album.UpdateAlbumParams = {
        name: formData.value.name,
        coverImage: formData.value.coverImage,
        addressId: formData.value.addressId,
        description: formData.value.description,
        tagIds: formData.value.tagIds,
        status: formData.value.status
      }

      if (props.type === 'edit' && props.editData) {
        ;(submitData as Api.Album.UpdateAlbumParams).id = props.editData.id
      }

      submitting.value = true
      emit('submit', submitData)
    } catch (error) {
      console.error('表单验证失败:', error)
    } finally {
      submitting.value = false
    }
  }

  // 取消
  const handleCancel = () => {
    visible.value = false
  }

  // 重置表单
  const resetForm = () => {
    formData.value = {
      name: '',
      coverImage: undefined,
      addressId: undefined,
      description: '',
      tagIds: [],
      status: StatusEnum.ENABLED
    }
    uploadFileList.value = []
    formRef.value?.resetFields()
  }

  // 初始化表单数据（编辑模式）
  const initFormData = () => {
    if (props.type === 'edit' && props.editData) {
      formData.value = {
        name: props.editData.name,
        coverImage: props.editData.coverImage || undefined,
        addressId: props.editData.addressId || undefined,
        description: props.editData.description || '',
        tagIds: props.editData.tags?.map((tag) => tag.id) || [],
        status: props.editData.status
      }

      // 如果有封面图片，添加到上传列表
      if (props.editData.coverImage) {
        uploadFileList.value = [
          {
            uid: Date.now(),
            name: props.editData.name || 'cover.jpg',
            url: props.editData.coverImage,
            status: 'success'
          } as UploadFile
        ]
      } else {
        uploadFileList.value = []
      }
    } else {
      resetForm()
    }
  }

  // 监听弹窗显示/隐藏
  watch(
    () => props.visible,
    (newVal) => {
      if (newVal) {
        initFormData()
      } else {
        resetForm()
      }
    },
    { immediate: true }
  )

  // 监听编辑数据变化
  watch(
    () => props.editData,
    () => {
      if (props.visible) {
        initFormData()
      }
    },
    { deep: true }
  )
</script>

<style scoped lang="scss">
  :deep(.el-upload__tip) {
    margin-top: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
</style>
