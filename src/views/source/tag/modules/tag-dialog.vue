<!-- 标签对话框组件 -->
<template>
  <ElDialog
    v-model="visible"
    :title="props.type === 'add' ? '新增标签' : '编辑标签'"
    width="800px"
    align-center
  >
    <ElForm
      ref="formRef"
      :model="props.type === 'edit' ? editFormData : addFormData"
      :rules="rules"
      label-width="110px"
    >
      <!-- 标签组信息（两列布局） -->
      <ElRow :gutter="20">
        <ElCol :span="11">
          <ElFormItem label="标签组名称" prop="groupName">
            <ElSelect
              v-if="props.type === 'edit'"
              v-model="editFormData.groupName"
              :disabled="props.type === 'edit' || !!props.presetGroupName"
              filterable
              clearable
              allow-create
              placeholder="请选择或输入标签组名称"
              @change="handleGroupNameChange"
            >
              <ElOption
                v-for="group in tagGroupOptions"
                :key="group.groupCode"
                :label="group.groupName"
                :value="group.groupName"
              />
            </ElSelect>
            <ElSelect
              v-else
              v-model="addFormData.groupName"
              :disabled="!!props.presetGroupName"
              filterable
              clearable
              allow-create
              placeholder="请选择或输入标签组名称"
              @change="handleGroupNameChange"
            >
              <ElOption
                v-for="group in tagGroupOptions"
                :key="group.groupCode"
                :label="group.groupName"
                :value="group.groupName"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="11">
          <ElFormItem label="标签组代码" prop="groupCode">
            <ElInput
              v-if="props.type === 'edit'"
              v-model="editFormData.groupCode"
              placeholder="请输入标签组代码"
              :disabled="props.type === 'edit' || isGroupNameFromStore || !!props.presetGroupCode"
            />
            <ElInput
              v-else
              v-model="addFormData.groupCode"
              placeholder="请输入标签组代码"
              :disabled="isGroupNameFromStore || !!props.presetGroupCode"
              @blur="updateSorts"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <!-- 编辑模式：单个标签编辑 -->
      <template v-if="props.type === 'edit'">
        <ElRow :gutter="20">
          <ElCol :span="11">
            <ElFormItem label="标签名" prop="label">
              <ElInput v-model="editFormData.label" placeholder="请输入标签名" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="11">
            <ElFormItem label="标签值" prop="value">
              <ElInput
                v-model="editFormData.value"
                :placeholder="`不填写默认与标签名相同${editFormData.label ? `（${editFormData.label}）` : ''}`"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow :gutter="20">
          <ElCol :span="11">
            <ElFormItem label="排序" prop="sort">
              <ElInputNumber
                v-model="editFormData.sort"
                :min="0"
                placeholder="请输入排序"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="11">
            <ElFormItem label="状态" prop="status">
              <ElRadioGroup v-model="editFormData.status">
                <ElRadio :label="StatusEnum.ENABLED">启用</ElRadio>
                <ElRadio :label="StatusEnum.DISABLED">禁用</ElRadio>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow>
          <ElCol :span="22">
            <ElFormItem label="描述" prop="description">
              <ElInput
                v-model="editFormData.description"
                type="textarea"
                :rows="3"
                placeholder="请输入描述"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>
      </template>

      <!-- 新增模式：批量标签添加 -->
      <template v-else>
        <div v-for="(tag, index) in addFormData.tags" :key="index" class="tag-item-block mb-4">
          <!-- <div class="tag-item-header">
            <span class="tag-item-title">标签项 {{ index + 1 }}</span>
            <ElButton
              v-if="addFormData.tags.length > 1"
              type="danger"
              link
              size="small"
              @click="handleRemoveTag(index)"
            >
              删除
            </ElButton>
          </div> -->

          <!-- 标签名和值（两列） -->
          <ElRow :gutter="20">
            <ElCol :span="11">
              <ElFormItem label="标签名" :prop="`tags.${index}.label`" :rules="tagRules.label">
                <ElInput
                  v-model="tag.label"
                  placeholder="请输入标签名"
                  @input="handleLabelInput(index)"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="11">
              <ElFormItem label="标签值" :prop="`tags.${index}.value`">
                <ElInput
                  v-model="tag.value"
                  :placeholder="`不填写默认与标签名相同${tag.label ? `（${tag.label}）` : ''}`"
                  @focus="handleValueFocus(index)"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="2">
              <ElButton
                v-if="addFormData.tags.length > 1"
                type="danger"
                link
                size="small"
                @click="handleRemoveTag(index)"
              >
                删除
              </ElButton>
            </ElCol>
          </ElRow>

          <!-- 排序和状态（两列） -->
          <ElRow :gutter="20">
            <ElCol :span="11">
              <ElFormItem label="排序" :prop="`tags.${index}.sort`" :rules="tagRules.sort">
                <ElInputNumber
                  v-model="tag.sort"
                  :min="0"
                  placeholder="请输入排序"
                  style="width: 100%"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="11">
              <ElFormItem label="状态" :prop="`tags.${index}.status`" :rules="tagRules.status">
                <ElRadioGroup v-model="tag.status">
                  <ElRadio :label="StatusEnum.ENABLED">启用</ElRadio>
                  <ElRadio :label="StatusEnum.DISABLED">禁用</ElRadio>
                </ElRadioGroup>
              </ElFormItem>
            </ElCol>
          </ElRow>

          <!-- 描述（可展开） -->
          <ElRow v-if="tag.showDescription">
            <ElCol :span="24">
              <ElFormItem label="描述" :prop="`tags.${index}.description`">
                <ElInput
                  v-model="tag.description"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入描述"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <!-- 描述按钮 -->
          <div v-if="!tag.showDescription" class="description-toggle">
            <ElButton type="primary" link size="small" @click="handleToggleDescription(index)">
              + 添加描述
            </ElButton>
          </div>
        </div>

        <!-- 添加标签按钮 -->
        <div class="text-center">
          <ElButton type="primary" link @click="handleAddTag"> + 添加标签项 </ElButton>
        </div>
      </template>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="visible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确定</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, watch, computed, nextTick } from 'vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { DialogType } from '@/types'
  import { StatusEnum } from '@/constants/enums'
  import { useTagStore } from '@/store/modules/tag'
  import { createDictNameValidator, createDictCodeValueValidator } from '@/utils/form/validator'

  defineOptions({ name: 'TagDialog' })

  const props = defineProps<{
    visible: boolean
    type: DialogType
    editData?: Api.Tag.TagData | null
    presetGroupCode?: string // 预设的组代码（用于从组节点新增时）
    presetGroupName?: string // 预设的组名称（用于从组节点新增时）
  }>()

  const emit = defineEmits<{
    'update:visible': [value: boolean]
    submit: [data: Api.Tag.BatchCreateTagParams | Api.Tag.UpdateTagParams]
  }>()

  const formRef = ref<FormInstance>()
  const tagStore = useTagStore()

  const visible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  // 从 store 获取所有标签组选项（去重）
  const tagGroupOptions = computed(() => {
    const groupMap = new Map<string, { groupCode: string; groupName: string }>()
    tagStore.treeData.forEach((item) => {
      if (!groupMap.has(item.groupCode)) {
        groupMap.set(item.groupCode, {
          groupCode: item.groupCode,
          groupName: item.groupName
        })
      }
    })
    return Array.from(groupMap.values())
  })

  // 判断当前组名称是否来自 store
  const isGroupNameFromStore = computed(() => {
    const groupName =
      props.type === 'edit' ? editFormData.value.groupName : addFormData.value.groupName
    if (!groupName) return false
    return tagGroupOptions.value.some((group) => group.groupName === groupName)
  })

  // 根据组代码获取该组下的最大排序值
  const getMaxSortByGroupCode = (groupCode: string): number => {
    if (!groupCode) return 0
    const currentGroup = tagStore.treeData.find((item) => item.groupCode === groupCode)
    return currentGroup?.children?.reduce((max, item) => Math.max(max, item.sort), 0) || 0
  }

  /**
   * 更新所有标签的排序值
   */
  const updateSorts = () => {
    if (props.type === 'add') {
      const groupCode = props.presetGroupCode || addFormData.value.groupCode
      const maxSort = getMaxSortByGroupCode(groupCode)
      addFormData.value.tags.forEach((tag: TagItemWithUI, index: number) => {
        tag.sort = maxSort + index + 1
      })
    }
  }

  /**
   * 处理组名称变化
   * 如果选择的是已有的组名称，自动填充组代码
   */
  const handleGroupNameChange = (groupName: string) => {
    if (!groupName) return

    const selectedGroup = tagGroupOptions.value.find((group) => group.groupName === groupName)
    if (selectedGroup) {
      // 如果选择的是已有的组，自动填充组代码
      if (props.type === 'edit') {
        editFormData.value.groupCode = selectedGroup.groupCode
      } else {
        addFormData.value.groupCode = selectedGroup.groupCode
        // 更新排序值
        updateSorts()
      }
    } else {
      // 如果是新建的组名称，清空组代码让用户手动输入
      if (props.type === 'add') {
        addFormData.value.groupCode = ''
        addFormData.value.tags.forEach((tag, index) => {
          tag.sort = index + 1
        })
      }
    }

    // 重新验证groupCode
    formRef.value?.validateField('groupCode')
  }

  /**
   * 处理标签名输入
   */
  const handleLabelInput = (index: number) => {
    const tag = addFormData.value.tags[index]
    // 如果标签值还没有被手动修改过，自动同步标签名
    if (!tag.valueModified && tag.label) {
      tag.value = tag.label
    }
  }

  /**
   * 处理标签值获得焦点
   */
  const handleValueFocus = (index: number) => {
    const tag = addFormData.value.tags[index]
    // 标记为已手动修改
    tag.valueModified = true
  }

  /**
   * 添加标签项
   */
  const handleAddTag = () => {
    const maxSort = addFormData.value.tags.reduce(
      (max: number, tag: TagItemWithUI) => Math.max(max, tag.sort || 0),
      0
    )
    addFormData.value.tags.push({
      label: '',
      value: '',
      sort: maxSort + 1,
      status: StatusEnum.ENABLED,
      description: '',
      showDescription: false,
      valueModified: false
    })
  }

  /**
   * 删除标签项
   */
  const handleRemoveTag = (index: number) => {
    addFormData.value.tags.splice(index, 1)
    // 重新计算排序
    updateSorts()
  }

  /**
   * 切换描述显示
   */
  const handleToggleDescription = (index: number) => {
    addFormData.value.tags[index].showDescription = true
  }

  // 编辑模式的表单数据
  const editFormData = ref<Api.Tag.UpdateTagParams>({
    groupCode: '',
    groupName: '',
    label: '',
    value: '',
    sort: 1,
    status: StatusEnum.ENABLED,
    description: ''
  })

  // 新增模式的表单数据
  interface TagItemWithUI extends Api.Tag.TagItemParams {
    showDescription?: boolean
    valueModified?: boolean
  }

  const addFormData = ref<{
    groupCode: string
    groupName: string
    tags: TagItemWithUI[]
  }>({
    groupCode: '',
    groupName: '',
    tags: [
      {
        label: '',
        value: '',
        sort: 1,
        status: StatusEnum.ENABLED,
        description: '',
        showDescription: false,
        valueModified: false
      }
    ]
  })

  // 标签项验证规则
  const tagRules: FormRules = {
    label: [
      { required: true, message: '请输入标签名', trigger: 'blur' },
      { validator: createDictNameValidator('标签名'), trigger: 'blur' }
    ],
    sort: [{ required: true, message: '请输入排序', trigger: 'blur' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]
  }

  // 表单验证规则
  const rules: FormRules = {
    groupCode: [
      { required: true, message: '请输入标签组代码', trigger: 'blur' },
      { validator: createDictCodeValueValidator('标签组代码'), trigger: 'blur' }
    ],
    groupName: [
      { required: true, message: '请输入标签组名称', trigger: 'blur' },
      { validator: createDictNameValidator('标签组名称'), trigger: 'blur' }
    ],
    label: [
      { required: true, message: '请输入标签名', trigger: 'blur' },
      { validator: createDictNameValidator('标签名'), trigger: 'blur' }
    ],
    sort: [{ required: true, message: '请输入排序', trigger: 'blur' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]
  }

  /**
   * 初始化表单数据
   */
  const initFormData = () => {
    if (props.type === 'edit' && props.editData) {
      Object.assign(editFormData.value, props.editData)
      // 编辑时，如果value为空，使用label作为value
      if (!editFormData.value.value) {
        editFormData.value.value = editFormData.value.label
      }
    } else {
      // 重置新增表单
      addFormData.value = {
        groupCode: '',
        groupName: '',
        tags: [
          {
            label: '',
            value: '',
            sort: 1,
            status: StatusEnum.ENABLED,
            description: '',
            showDescription: false,
            valueModified: false
          }
        ]
      }
      // 如果有预设的组代码和名称，使用预设值
      if (props.presetGroupCode && props.presetGroupName) {
        addFormData.value.groupCode = props.presetGroupCode
        addFormData.value.groupName = props.presetGroupName
      }
      // 新增时，根据组代码计算排序默认值
      nextTick(() => {
        updateSorts()
      })
    }
    // 重置表单验证状态
    nextTick(() => {
      formRef.value?.clearValidate()
    })
  }

  /**
   * 处理提交
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()

      if (props.type === 'add') {
        // 批量创建模式
        const submitData: Api.Tag.BatchCreateTagParams = {
          groupCode: addFormData.value.groupCode,
          groupName: addFormData.value.groupName,
          tags: addFormData.value.tags
            .filter((tag) => tag.label && tag.label.trim()) // 过滤空标签
            .map((tag) => ({
              label: tag.label,
              value: tag.value || tag.label, // 如果value为空，使用label
              sort: tag.sort,
              status: tag.status,
              description: tag.description || undefined
            }))
        }
        emit('submit', submitData)
      } else {
        // 编辑模式
        const submitData: Api.Tag.UpdateTagParams = { ...editFormData.value }
        if (!submitData.value) {
          submitData.value = submitData.label!
        }
        emit('submit', submitData)
      }
    } catch (error) {
      console.error('表单验证失败', error)
    }
  }

  // 监听组代码变化，更新排序值
  watch(
    () => (props.type === 'add' ? addFormData.value.groupCode : editFormData.value.groupCode),
    () => {
      if (props.type === 'add') {
        updateSorts()
      }
    }
  )

  watch(
    () => [props.visible, props.presetGroupCode, props.presetGroupName],
    ([visible]) => {
      if (visible) {
        initFormData()
      }
    },
    { immediate: true }
  )
</script>

<style scoped lang="scss">
  .tag-item-block {
    position: relative;
    padding: 8px 8px 0;
    background-color: var(--el-bg-color-page);
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;

    .description-toggle {
      position: absolute;
      right: 10px;
      bottom: 10px;
    }
  }
</style>
