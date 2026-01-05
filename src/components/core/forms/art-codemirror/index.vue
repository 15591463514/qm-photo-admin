<template>
  <div class="art-codemirror-wrapper">
    <Codemirror
      :model-value="modelValue"
      :placeholder="placeholder"
      :style="editorStyle"
      :autofocus="autofocus"
      :indent-with-tab="indentWithTab"
      :tab-size="tabSize"
      :extensions="extensions"
      @update:model-value="handleUpdate"
      @ready="handleReady"
    />
    <div v-if="hint" class="art-codemirror-hint">{{ hint }}</div>
  </div>
</template>

<script setup lang="ts">
  import { computed, shallowRef } from 'vue'
  import { Codemirror } from 'vue-codemirror'
  import { javascript } from '@codemirror/lang-javascript'
  import { json } from '@codemirror/lang-json'
  import { oneDark } from '@codemirror/theme-one-dark'
  import { autocompletion } from '@codemirror/autocomplete'
  import { lintGutter, lintKeymap, linter } from '@codemirror/lint'
  import { searchKeymap } from '@codemirror/search'
  import { keymap } from '@codemirror/view'
  import { jsonParseLinter } from '@codemirror/lang-json'
  import type { Extension } from '@codemirror/state'
  import type { EditorView } from '@codemirror/view'
  import { formatCode } from './formatting'

  defineOptions({ name: 'ArtCodemirror' })

  interface Props {
    modelValue: string
    language?: 'javascript' | 'json'
    placeholder?: string
    height?: string
    autofocus?: boolean
    indentWithTab?: boolean
    tabSize?: number
    hint?: string
    extensions?: Extension[]
    enableLint?: boolean
    enableSearch?: boolean
    enableAutocomplete?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    language: 'javascript',
    placeholder: '请输入代码...',
    height: '300px',
    autofocus: true,
    indentWithTab: true,
    tabSize: 2,
    enableLint: true,
    enableSearch: true,
    enableAutocomplete: true
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string]
  }>()

  const viewRef = shallowRef<EditorView>()

  const editorStyle = computed(() => ({
    height: props.height
  }))

  const extensions = computed(() => {
    const baseExtensions: Extension[] = [oneDark]

    // 根据语言添加对应的语言支持
    if (props.language === 'json') {
      baseExtensions.push(json())
      // JSON 语法检查
      if (props.enableLint) {
        baseExtensions.push(lintGutter(), linter(jsonParseLinter()))
      }
    } else {
      baseExtensions.push(javascript())
      // JavaScript 语法检查
      if (props.enableLint) {
        baseExtensions.push(lintGutter())
      }
    }

    // 自动完成
    if (props.enableAutocomplete) {
      baseExtensions.push(autocompletion())
    }

    // 格式化快捷键 (Mac: Shift+Option+F, Windows: Shift+Alt+F)
    // 放在搜索功能之前，确保优先级
    baseExtensions.push(
      keymap.of([
        {
          key: 'Mod-Shift-f',
          run: (view: EditorView) => {
            formatCode(view)
            return true
          }
        }
      ])
    )

    // 搜索功能
    if (props.enableSearch) {
      baseExtensions.push(keymap.of(searchKeymap))
    }

    // 代码检查快捷键
    if (props.enableLint) {
      baseExtensions.push(keymap.of(lintKeymap))
    }

    // 如果有自定义扩展，添加到末尾
    if (props.extensions) {
      baseExtensions.push(...props.extensions)
    }

    return baseExtensions
  })

  const handleUpdate = (value: string) => {
    emit('update:modelValue', value)
  }

  const handleReady = (payload: { view: EditorView; state: any }) => {
    viewRef.value = payload.view
  }

  defineExpose({
    view: viewRef
  })
</script>

<style scoped lang="scss">
  .art-codemirror-wrapper {
    width: 100%;

    :deep(.cm-editor) {
      height: auto;
    }

    :deep(.cm-editor .cm-scroller) {
      min-height: 200px;
    }
  }

  .art-codemirror-hint {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
  }
</style>
