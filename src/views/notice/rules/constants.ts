/**
 * 通知规则相关常量
 */

/**
 * 默认的处理脚本模板
 */
export const DEFAULT_HANDLER_SCRIPT = `function formatContent(jsonObject) {
  return {
    subject: \`通知 - \${jsonObject.title || '系统通知'}\`,
    content: \`<h2>\${jsonObject.title || '系统通知'}</h2>
              <p>\${JSON.stringify(jsonObject, null, 2)}</p>\`
  };
}`
