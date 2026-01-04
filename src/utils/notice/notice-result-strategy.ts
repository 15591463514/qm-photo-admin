/**
 * 通知结果标签策略模式
 *
 * 根据通知成功数和总数，使用策略模式决定标签类型
 *
 * @module utils/notice/notice-result-strategy
 */

export type TagType = 'success' | 'warning' | 'danger' | 'info'

/**
 * 策略接口
 */
interface NoticeResultStrategy {
  /**
   * 判断是否匹配该策略
   * @param success 成功数
   * @param total 总数
   */
  match(success: number, total: number): boolean

  /**
   * 获取标签类型
   */
  getTagType(): TagType
}

/**
 * 全部成功策略（x/x）
 */
class AllSuccessStrategy implements NoticeResultStrategy {
  match(success: number, total: number): boolean {
    return total > 0 && success === total
  }

  getTagType(): TagType {
    return 'success'
  }
}

/**
 * 部分成功策略（y/x，0 < y < x）
 */
class PartialSuccessStrategy implements NoticeResultStrategy {
  match(success: number, total: number): boolean {
    return total > 0 && success > 0 && success < total
  }

  getTagType(): TagType {
    return 'warning'
  }
}

/**
 * 全部失败策略（0/x）
 */
class AllFailedStrategy implements NoticeResultStrategy {
  match(success: number, total: number): boolean {
    return total > 0 && success === 0
  }

  getTagType(): TagType {
    return 'danger'
  }
}

/**
 * 无数据策略（0/0）
 */
class NoDataStrategy implements NoticeResultStrategy {
  match(success: number, total: number): boolean {
    return total === 0
  }

  getTagType(): TagType {
    return 'info'
  }
}

/**
 * 策略上下文
 */
class NoticeResultContext {
  private strategies: NoticeResultStrategy[] = []

  constructor() {
    // 按优先级添加策略（从具体到一般）
    this.strategies = [
      new AllSuccessStrategy(),
      new PartialSuccessStrategy(),
      new AllFailedStrategy(),
      new NoDataStrategy()
    ]
  }

  /**
   * 根据成功数和总数获取标签类型
   * @param success 成功数
   * @param total 总数
   * @returns 标签类型
   */
  getTagType(success: number, total: number): TagType {
    for (const strategy of this.strategies) {
      if (strategy.match(success, total)) {
        return strategy.getTagType()
      }
    }
    // 默认返回 info
    return 'info'
  }
}

// 创建单例实例
const noticeResultContext = new NoticeResultContext()

/**
 * 获取通知结果标签类型
 * @param success 成功数
 * @param total 总数
 * @returns 标签类型
 */
export function getNoticeResultTagType(success: number, total: number): TagType {
  return noticeResultContext.getTagType(success, total)
}

/**
 * 格式化通知结果文本
 * @param success 成功数
 * @param total 总数
 * @returns 格式化的文本（如 "2/3"）
 */
export function formatNoticeResult(success: number, total: number): string {
  return `${success ?? 0}/${total ?? 0}`
}
