<template>
  <ElDialog v-model="dialogVisible" title="测试规则" width="60%" :close-on-click-modal="false">
    <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="120px">
      <ElFormItem label="规则名称" prop="ruleName">
        <ElInput v-model="formData.ruleName" placeholder="请输入规则名称" disabled />
      </ElFormItem>
      <ElFormItem label="消息来源" prop="msgSource">
        <ElInput v-model="formData.msgSource" placeholder="请输入消息来源" />
      </ElFormItem>
      <ElFormItem label="消息类型" prop="msgType">
        <ElSelect
          v-model="formData.msgType"
          filterable
          clearable
          placeholder="请选择消息类型"
          style="width: 100%"
        >
          <ElOption
            v-for="option in msgTypeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="通知方式" prop="noticeMode">
        <ElSelect v-model="formData.noticeMode" style="width: 100%" disabled>
          <ElOption :label="NoticeModeText[NoticeModeEnum.EMAIL]" :value="NoticeModeEnum.EMAIL" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="通知地址" prop="noticeAddress">
        <ElInput
          v-model="formData.noticeAddress"
          type="textarea"
          :rows="3"
          placeholder="请输入邮箱地址，多个邮箱用英文分号分隔（测试时可修改为您的邮箱）"
        />
      </ElFormItem>
      <ElFormItem label="测试数据" prop="eventData">
        <ArtCodemirror
          v-model="formData.eventData"
          language="json"
          placeholder="请输入测试数据（JSON格式）"
          height="300px"
          :tab-size="2"
          hint='请输入JSON格式的测试数据，例如：{"title": "测试通知", "content": "这是一条测试消息"}'
        />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="handleCancel">取消</ElButton>
      <ElButton type="primary" :loading="testing" @click="handleTest">测试</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import {
    ElDialog,
    ElForm,
    ElFormItem,
    ElInput,
    ElButton,
    ElSelect,
    ElOption,
    ElMessage
  } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { NoticeModeEnum, NoticeModeText } from '@/types/notice'
  import type { NoticeRule } from '@/types/notice'
  import { testRule } from '@/api/notice'
  import ArtCodemirror from '@/components/core/forms/art-codemirror/index.vue'
  import { useDictStore } from '@/store/modules/dict'
  import { computed, watch, nextTick } from 'vue'
  import { getNoticeResultTagType, type TagType } from '@/utils/notice/notice-result-strategy'

  defineOptions({ name: 'RulesTestDialog' })

  const props = defineProps<{
    visible: boolean
    ruleData?: Partial<NoticeRule>
  }>()

  const emit = defineEmits<{
    'update:visible': [value: boolean]
  }>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const formRef = ref<FormInstance>()
  const dictStore = useDictStore()
  const testing = ref(false)

  // 消息类型选项（从字典 store 获取）
  const msgTypeOptions = computed(() => {
    const dicts = dictStore.getDictByType('msg_type')
    return dicts.map((dict) => ({
      label: dict.dataLabel,
      value: dict.dataValue
    }))
  })

  const formData = ref({
    ruleName: '',
    msgSource: '',
    msgType: '',
    noticeMode: NoticeModeEnum.EMAIL,
    noticeAddress: '',
    eventData: '{\n  "title": "测试通知",\n  "content": "这是一条测试消息"\n}'
  })

  const formRules: FormRules = {
    msgSource: [{ required: true, message: '请输入消息来源', trigger: 'blur' }],
    msgType: [{ required: true, message: '请选择消息类型', trigger: 'blur' }],
    noticeAddress: [{ required: true, message: '请输入通知地址', trigger: 'blur' }],
    eventData: [
      { required: true, message: '请输入测试数据', trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          if (!value) {
            callback(new Error('请输入测试数据'))
            return
          }
          try {
            JSON.parse(value)
            callback()
          } catch {
            callback(new Error('测试数据必须是有效的JSON格式'))
          }
        },
        trigger: 'blur'
      }
    ]
  }

  watch(
    () => props.visible,
    (visible) => {
      if (visible && props.ruleData) {
        // 如果有入参示例，使用入参示例；否则使用默认测试数据
        let defaultEventData = '{\n  "title": "测试通知",\n  "content": "这是一条测试消息"\n}'
        if (props.ruleData.eventDataExample && props.ruleData.eventDataExample.trim()) {
          try {
            // 验证 JSON 格式，如果有效则使用
            JSON.parse(props.ruleData.eventDataExample)
            defaultEventData = props.ruleData.eventDataExample
          } catch {
            // 如果格式无效，使用默认值
            console.warn('入参示例格式无效，使用默认测试数据')
          }
        }

        // 默认填写当前规则的信息
        formData.value = {
          ruleName: props.ruleData.ruleName || '',
          msgSource: props.ruleData.msgSource || '',
          msgType: props.ruleData.msgType || '',
          noticeMode: props.ruleData.noticeMode || NoticeModeEnum.EMAIL,
          noticeAddress: props.ruleData.noticeAddress || '',
          eventData: defaultEventData
        }
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    },
    { immediate: true }
  )

  /**
   * 根据标签类型显示对应的消息
   */
  const showMessageByTagType = (message: string, tagType: TagType) => {
    const messageType = tagType === 'danger' ? 'error' : tagType
    ElMessage[messageType as 'success' | 'warning' | 'error' | 'info'](message)
  }

  /**
   * 显示测试结果
   */
  const showTestResult = (result: { message: string; success: number; total: number }) => {
    const { message, success, total } = result
    const tagType = getNoticeResultTagType(success, total)
    showMessageByTagType(message, tagType)
  }

  /**
   * 从错误响应中提取测试结果
   */
  const extractResultFromError = (
    error: any
  ): { message: string; success: number; total: number } | null => {
    if (error?.response?.data?.data) {
      return {
        message: error.response.data.data.message || '测试失败',
        success: error.response.data.data.success || 0,
        total: error.response.data.data.total || 0
      }
    }
    if (error?.response?.data) {
      const errorData = error.response.data
      return {
        message: errorData.data?.message || errorData.message || '测试失败',
        success: errorData.data?.success || 0,
        total: errorData.data?.total || 0
      }
    }
    return null
  }

  const handleCancel = () => {
    dialogVisible.value = false
  }

  const handleTest = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      testing.value = true

      // 解析测试数据
      let eventDataObj: Record<string, any>
      try {
        eventDataObj = JSON.parse(formData.value.eventData)
      } catch {
        ElMessage.error('测试数据格式错误，必须是有效的JSON格式')
        testing.value = false
        return
      }

      // 调用测试API
      const response = await testRule({
        msgSource: formData.value.msgSource,
        msgType: formData.value.msgType,
        eventData: eventDataObj,
        noticeAddress: formData.value.noticeAddress
      })

      // 显示测试结果
      const result = response || { message: '测试完成', success: 0, total: 0 }
      showTestResult(result)
    } catch (error: any) {
      console.error('测试失败:', error)
      const result = extractResultFromError(error)
      if (result && result.total > 0) {
        showTestResult(result)
      } else {
        ElMessage.error(error?.message || '测试发送失败')
      }
    } finally {
      testing.value = false
    }
  }
</script>
