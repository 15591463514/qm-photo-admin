<!-- 地址表单对话框 -->
<template>
  <ElDialog
    v-model="dialogVisible"
    :title="isEditMode ? '编辑地址' : '新增地址'"
    width="80%"
    :close-on-click-modal="false"
    @close="handleClose"
    top="5vh"
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px" class="address-form">
      <ElRow :gutter="20">
        <!-- 左侧：表单 -->
        <ElCol :xs="24" :md="6">
          <ElFormItem label="地址名称" prop="name">
            <ElInput v-model="formData.name" placeholder="请输入地址名称" clearable />
          </ElFormItem>

          <ElFormItem label="详细地址" prop="detail">
            <ElInput
              v-model="formData.detail"
              type="textarea"
              :rows="3"
              placeholder="从地图选择或手动输入"
              clearable
            />
          </ElFormItem>

          <ElFormItem label="经度" prop="longitude">
            <ElInput v-model.number="formData.longitude" placeholder="经度" readonly />
          </ElFormItem>

          <ElFormItem label="纬度" prop="latitude">
            <ElInput v-model.number="formData.latitude" placeholder="纬度" readonly />
          </ElFormItem>

          <ElFormItem label="省">
            <ElInput v-model="formData.province" placeholder="自动填充" readonly />
          </ElFormItem>

          <ElFormItem label="市">
            <ElInput v-model="formData.city" placeholder="自动填充" readonly />
          </ElFormItem>

          <ElFormItem label="区/县">
            <ElInput v-model="formData.district" placeholder="自动填充" readonly />
          </ElFormItem>

          <ElFormItem label="描述" prop="description">
            <ElInput
              v-model="formData.description"
              type="textarea"
              :rows="4"
              placeholder="请输入描述信息"
              clearable
            />
          </ElFormItem>

          <ElFormItem label="状态" prop="status">
            <ElRadioGroup v-model="formData.status">
              <ElRadio :label="StatusEnum.ENABLED">启用</ElRadio>
              <ElRadio :label="StatusEnum.DISABLED">禁用</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>

        <!-- 右侧：地图选择器 -->
        <ElCol :xs="24" :md="18">
          <div class="map-wrapper">
            <AmapPicker
              :longitude="formData.longitude || DEFAULT_LONGITUDE"
              :latitude="formData.latitude || DEFAULT_LATITUDE"
              @change="handleLocationChange"
            />
          </div>
        </ElCol>
      </ElRow>
    </ElForm>

    <template #footer>
      <div class="flex-c justify-end gap-2">
        <ElButton @click="handleClose">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit" :loading="submitting"> 确定 </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import {
    ElDialog,
    ElForm,
    ElFormItem,
    ElInput,
    ElButton,
    ElRadioGroup,
    ElRadio,
    ElRow,
    ElCol,
    ElMessage,
    type FormInstance,
    type FormRules
  } from 'element-plus'
  import AmapPicker from '@/components/core/maps/amap-picker.vue'
  import { fetchCreateAddress, fetchUpdateAddress, fetchGetAddressDetail } from '@/api/address'
  import { StatusEnum } from '@/constants/enums'

  interface Props {
    modelValue: boolean
    addressId?: number | null
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    addressId: null
  })

  const emit = defineEmits<Emits>()

  const dialogVisible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const isEditMode = computed(() => !!props.addressId)

  const formRef = ref<FormInstance>()
  const submitting = ref(false)

  // 默认坐标（北京天安门）
  const DEFAULT_LONGITUDE = 116.397128
  const DEFAULT_LATITUDE = 39.903738

  // 表单数据
  const formData = ref<Api.Address.CreateAddressParams>({
    name: '',
    detail: '',
    longitude: DEFAULT_LONGITUDE,
    latitude: DEFAULT_LATITUDE,
    province: '',
    city: '',
    district: '',
    adcode: '',
    description: '',
    status: StatusEnum.ENABLED
  })

  // 获取浏览器当前位置
  const getCurrentPosition = (): Promise<{ longitude: number; latitude: number }> => {
    return new Promise((resolve, reject) => {
      // 检查浏览器是否支持 Geolocation API
      if (!navigator.geolocation) {
        reject(new Error('浏览器不支持地理位置服务'))
        return
      }

      // 获取当前位置
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
          })
        },
        (error) => {
          // 用户拒绝或获取失败，使用默认值
          console.warn('获取当前位置失败:', error.message)
          resolve({
            longitude: DEFAULT_LONGITUDE,
            latitude: DEFAULT_LATITUDE
          })
        },
        {
          enableHighAccuracy: true, // 尝试使用高精度定位
          timeout: 5000, // 超时时间 5 秒
          maximumAge: 0 // 不使用缓存的位置
        }
      )
    })
  }

  // 表单验证规则
  const rules: FormRules = {
    name: [
      { required: true, message: '请输入地址名称', trigger: 'blur' },
      { max: 100, message: '地址名称不能超过100个字符', trigger: 'blur' }
    ],
    detail: [
      { required: true, message: '请输入详细地址', trigger: 'blur' },
      { max: 500, message: '详细地址不能超过500个字符', trigger: 'blur' }
    ],
    longitude: [{ required: true, message: '请选择位置', trigger: 'blur' }],
    latitude: [{ required: true, message: '请选择位置', trigger: 'blur' }]
  }

  // 加载地址详情
  const loadAddressDetail = async () => {
    if (!props.addressId) return

    try {
      const address = await fetchGetAddressDetail(props.addressId)
      formData.value = {
        name: address.name,
        detail: address.detail,
        longitude: address.longitude,
        latitude: address.latitude,
        province: address.province || '',
        city: address.city || '',
        district: address.district || '',
        adcode: address.adcode || '',
        description: address.description || '',
        status: address.status
      }
    } catch (error: any) {
      ElMessage.error(error.message || '加载地址详情失败')
    }
  }

  // 地图位置变化
  const handleLocationChange = (location: {
    detail: string
    longitude: number
    latitude: number
    province?: string
    city?: string
    district?: string
    adcode?: string
  }) => {
    formData.value.detail = location.detail
    formData.value.longitude = location.longitude
    formData.value.latitude = location.latitude
    formData.value.province = location.province || ''
    formData.value.city = location.city || ''
    formData.value.district = location.district || ''
    formData.value.adcode = location.adcode || ''
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (!valid) return

      submitting.value = true
      try {
        if (isEditMode.value) {
          await fetchUpdateAddress({
            id: props.addressId!,
            ...formData.value
          })
          ElMessage.success('更新成功')
        } else {
          await fetchCreateAddress(formData.value)
          ElMessage.success('创建成功')
        }
        emit('success')
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败')
      } finally {
        submitting.value = false
      }
    })
  }

  // 关闭弹窗
  const handleClose = () => {
    dialogVisible.value = false
    formRef.value?.resetFields()
    // 重置表单数据
    formData.value = {
      name: '',
      detail: '',
      longitude: DEFAULT_LONGITUDE,
      latitude: DEFAULT_LATITUDE,
      province: '',
      city: '',
      district: '',
      adcode: '',
      description: '',
      status: StatusEnum.ENABLED
    }
  }

  // 监听弹窗显示，加载数据
  watch(
    () => dialogVisible.value,
    async (visible) => {
      if (visible && isEditMode.value) {
        // 编辑模式，加载地址详情
        loadAddressDetail()
      } else if (visible) {
        // 新增模式，重置表单并获取当前位置
        formRef.value?.resetFields()
        formData.value = {
          name: '',
          detail: '',
          longitude: DEFAULT_LONGITUDE,
          latitude: DEFAULT_LATITUDE,
          province: '',
          city: '',
          district: '',
          adcode: '',
          description: '',
          status: StatusEnum.ENABLED
        }

        // 尝试获取浏览器当前位置
        try {
          const position = await getCurrentPosition()
          formData.value.longitude = position.longitude
          formData.value.latitude = position.latitude
        } catch {
          // 获取失败，使用默认值（已在 getCurrentPosition 中处理）
          console.warn('使用默认位置')
        }
      }
    },
    { immediate: true }
  )
</script>

<style scoped lang="scss">
  .address-form {
    .map-wrapper {
      height: 70vh;
      overflow: hidden;
      border-radius: var(--el-border-radius-base);
    }
  }
</style>
