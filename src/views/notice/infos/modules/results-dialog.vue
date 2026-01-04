<template>
  <ElDialog v-model="dialogVisible" title="通知结果明细" width="50%" :close-on-click-modal="false">
    <ElTable :data="results" border style="width: 100%">
      <ElTableColumn prop="noticeMode" label="通知方式" width="120">
        <template #default="{ row }">
          <ElTag type="primary">{{ NoticeModeText[row.noticeMode as NoticeModeEnum] }}</ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="noticeAddress" label="通知地址" min-width="200" show-overflow-tooltip />
      <ElTableColumn prop="noticeResult" label="结果" width="120">
        <template #default="{ row }">
          <ElTag :type="row.noticeResult === 'success' ? 'success' : 'danger'">
            {{ row.noticeResult === 'success' ? '成功' : '失败' }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="description" label="说明" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">
          <span>{{ row.description || '-' }}</span>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="noticeResultTime" label="时间" width="180" />
    </ElTable>

    <template #footer>
      <ElButton @click="dialogVisible = false">关闭</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ElDialog, ElTable, ElTableColumn, ElTag, ElButton } from 'element-plus'
  import { NoticeModeText, NoticeModeEnum } from '@/types/notice'
  import type { NoticeResult } from '@/types/notice'
  import { fetchNotificationLogs } from '@/api/notice'

  defineOptions({ name: 'ResultsDialog' })

  const props = defineProps<{
    visible: boolean
    infoId?: number
  }>()

  const emit = defineEmits<{
    'update:visible': [value: boolean]
  }>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const results = ref<NoticeResult[]>([])

  watch(
    () => [props.visible, props.infoId],
    async ([visible, infoId]) => {
      if (visible && infoId && typeof infoId === 'number') {
        try {
          const logs = await fetchNotificationLogs(infoId)
          results.value = logs.map((log) => ({
            id: log.id,
            noticeMode: log.noticeMode,
            noticeAddress: log.noticeAddress,
            noticeResult: log.noticeResult || '',
            noticeResultTime: log.noticeResultTime || '',
            description: log.description || ''
          }))
        } catch (error) {
          console.error('加载通知结果失败:', error)
          results.value = []
        }
      }
    },
    { immediate: true }
  )
</script>

<style scoped lang="scss">
  // 对话框样式
</style>
