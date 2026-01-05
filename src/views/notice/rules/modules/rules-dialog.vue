<template>
  <ElDialog
    v-model="dialogVisible"
    :title="props.type === 'add' ? '新增规则' : '编辑规则'"
    width="60%"
    :close-on-click-modal="false"
  >
    <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="120px">
      <ElFormItem label="规则名称" prop="ruleName">
        <ElInput v-model="formData.ruleName" placeholder="请输入规则名称" />
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
        <ElSelect v-model="formData.noticeMode" style="width: 100%">
          <ElOption :label="NoticeModeText[NoticeModeEnum.EMAIL]" :value="NoticeModeEnum.EMAIL" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="通知地址" prop="noticeAddress">
        <ElInput
          v-model="formData.noticeAddress"
          type="textarea"
          :rows="3"
          placeholder="请输入邮箱地址，多个邮箱用英文分号分隔（可选，创建模板时可留空，调用时手动传递地址）"
        />
      </ElFormItem>
      <ElFormItem prop="enableRecord">
        <template #label>
          <span class="flex items-center gap-1">
            <ElTooltip
              content="开启后，系统会记录通知信息；关闭后，仅发送邮件但不记录数据"
              placement="top"
            >
              <ArtSvgIcon icon="ri:question-line" />
            </ElTooltip>
            开启记录
          </span>
        </template>
        <ElSwitch v-model="formData.enableRecord" />
      </ElFormItem>
      <ElFormItem label="处理脚本" prop="handlerScript">
        <ArtCodemirror
          v-model="formData.handlerScript!"
          language="javascript"
          placeholder="请输入处理脚本（JavaScript代码）"
          height="400px"
          :tab-size="4"
          hint="处理脚本需要返回包含 subject 和 content 的对象"
        />
      </ElFormItem>
      <ElFormItem label="入参示例" prop="eventDataExample">
        <ArtCodemirror
          v-model="formData.eventDataExample!"
          language="json"
          placeholder="请输入入参示例（JSON格式），测试时会自动填充到测试数据"
          height="200px"
          :tab-size="2"
          hint='输入JSON格式的示例数据，例如：{"data": {"title": "系统通知", "content": "这是一条系统通知"}}'
        />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit">确定</ElButton>
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
    ElSwitch,
    ElTooltip
  } from 'element-plus'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { NoticeModeEnum, NoticeModeText } from '@/types/notice'
  import type { NoticeRule } from '@/types/notice'
  import { DialogType } from '@/types'
  import { createRule, updateRule } from '@/api/notice'
  import { ElMessage } from 'element-plus'
  import ArtCodemirror from '@/components/core/forms/art-codemirror/index.vue'
  import { useDictStore } from '@/store/modules/dict'
  import { computed } from 'vue'
  import { DEFAULT_HANDLER_SCRIPT, DEFAULT_EVENT_DATA_EXAMPLE } from '../constants'

  defineOptions({ name: 'RulesDialog' })

  const props = defineProps<{
    visible: boolean
    type: DialogType
    ruleData?: Partial<NoticeRule>
  }>()

  const emit = defineEmits<{
    'update:visible': [value: boolean]
    submit: []
  }>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const formRef = ref<FormInstance>()
  const dictStore = useDictStore()

  // 消息类型选项（从字典 store 获取）
  const msgTypeOptions = computed(() => {
    const dicts = dictStore.getDictByType('msg_type')
    return dicts.map((dict) => ({
      label: dict.dataLabel,
      value: dict.dataValue
    }))
  })

  const formData = ref<Partial<NoticeRule>>({
    ruleName: '',
    msgSource: '',
    msgType: '',
    noticeMode: NoticeModeEnum.EMAIL,
    noticeAddress: '',
    handlerScript: DEFAULT_HANDLER_SCRIPT,
    eventDataExample: DEFAULT_EVENT_DATA_EXAMPLE,
    enableRecord: true,
    noticeStatus: 1
  })

  const formRules: FormRules = {
    ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
    msgSource: [{ required: true, message: '请输入消息来源', trigger: 'blur' }],
    msgType: [{ required: true, message: '请输入消息类型', trigger: 'blur' }],
    handlerScript: [{ required: true, message: '请输入处理脚本', trigger: 'blur' }]
  }

  watch(
    () => props.visible,
    (visible) => {
      if (visible) {
        if (props.type === 'edit' && props.ruleData) {
          formData.value = { ...props.ruleData }
        } else {
          formData.value = {
            ruleName: '',
            msgSource: '',
            msgType: '',
            noticeMode: NoticeModeEnum.EMAIL,
            noticeAddress: '',
            handlerScript: DEFAULT_HANDLER_SCRIPT,
            eventDataExample: DEFAULT_EVENT_DATA_EXAMPLE,
            enableRecord: true,
            noticeStatus: 1
          }
        }
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    },
    { immediate: true }
  )

  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()

      if (props.type === 'add') {
        await createRule(formData.value as Api.Notice.CreateRuleParams)
        ElMessage.success('新增成功')
      } else {
        await updateRule(formData.value.ruleId!, formData.value as Api.Notice.UpdateRuleParams)
        ElMessage.success('编辑成功')
      }

      emit('submit')
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }
</script>
