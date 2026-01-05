import { EditorView } from '@codemirror/view'

/**
 * 格式化代码命令
 * 参考 codemirror-formatting 的逻辑，适配 CodeMirror 6
 */
export function formatCode(view: EditorView): boolean {
  const { state } = view
  const { from, to } = state.selection.main

  // 获取选中的文本
  const selectedText = state.sliceDoc(from, to)
  if (!selectedText.trim()) {
    // 如果没有选中文本，格式化整个文档
    formatRange(view, 0, state.doc.length)
  } else {
    // 格式化选中的范围
    formatRange(view, from, to)
  }

  return true
}

/**
 * 格式化指定范围的代码
 */
function formatRange(view: EditorView, from: number, to: number): void {
  const { state } = view
  const text = state.sliceDoc(from, to)

  if (!text.trim()) return

  let formatted = ''

  // 检测语言类型（简单检测）
  const isJSON = isJSONText(text)

  if (isJSON) {
    // JSON 格式化
    try {
      const parsed = JSON.parse(text)
      formatted = JSON.stringify(parsed, null, 2)
    } catch (error) {
      console.error('JSON 格式化失败:', error)
      return
    }
  } else {
    // JavaScript 格式化（基于缩进和换行）
    formatted = formatJavaScript(text, 2)
  }

  if (formatted !== text) {
    view.dispatch({
      changes: {
        from,
        to,
        insert: formatted
      },
      selection: { anchor: from }
    })
  }
}

/**
 * 检测是否为 JSON 文本
 */
function isJSONText(text: string): boolean {
  const trimmed = text.trim()
  return (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  )
}

/**
 * JavaScript 格式化（基于缩进和换行规则）
 * 参考 codemirror-formatting 的逻辑
 */
function formatJavaScript(code: string, tabSize: number): string {
  const indent = ' '.repeat(tabSize)
  let result = ''
  let indentLevel = 0
  const lines = code.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      result += '\n'
      continue
    }

    // 减少缩进（在闭合括号前）
    if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
      indentLevel = Math.max(0, indentLevel - 1)
    }

    result += indent.repeat(indentLevel) + trimmed + '\n'

    // 增加缩进（在开放括号后）
    if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) {
      indentLevel++
    }
  }

  return result.trimEnd()
}
