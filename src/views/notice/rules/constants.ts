/**
 * 通知规则相关常量
 */

/**
 * 默认的处理脚本模板
 */
export const DEFAULT_HANDLER_SCRIPT = `function formatContent(data) {
  return {
    subject: \`通知 - \${data.title || '系统通知'}\`,
    content: \`<h2>\${data.title || '系统通知'}</h2>
              <p>\${JSON.stringify(data, null, 2)}</p>\`
  };
}`

/**
 * 默认的入参示例
 */
export const DEFAULT_EVENT_DATA_EXAMPLE = `{
  "title": "系统通知",
  "content": "这是一条系统通知"
}`
