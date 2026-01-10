/**
 * 直接将枚举值转换成options
 * @param json 枚举
 * @param text 枚举翻译
 */
export const enumToOptions: (
  enumList: Record<string, string | number>,
  text: { [key in string]: string }
) => Array<{ value: string | number; label: string }> = (enumList, text) => {
  const list = Object.keys(enumList).map((key) => enumList[key])
  return list
    .map((type) => ({
      value: type,
      label: text[type]
    }))
    .filter((item) => Boolean(item.label))
}

/**
 * 将枚举值的数组转换成options
 * @param list 枚举列表
 * @param text 枚举翻译
 */
export const enumListToOptions: <T extends symbol | string | number>(
  list: T[],
  text: Partial<Record<T, string>>
) => Array<{ value: T; label: string }> = (list, text) => {
  if (!list || !text) {
    return []
  }
  return list
    .map((type) => ({
      value: type,
      label: text[type] ?? ''
    }))
    .filter(({ label }) => {
      return !!label
    })
}
