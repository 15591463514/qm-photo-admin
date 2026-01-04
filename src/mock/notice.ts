/**
 * 通知模块假数据
 */
import type { NoticeRule, NoticeInfo, NoticeResult } from '@/types/notice'
import { NoticeStatusEnum, NoticeModeEnum } from '@/types/notice'

/**
 * 规则列表假数据
 */
export const mockRules: NoticeRule[] = [
  {
    ruleId: 1,
    ruleName: '图片上传成功通知',
    msgSource: 'image_upload',
    msgType: 'success',
    noticeMode: NoticeModeEnum.EMAIL,
    noticeAddress: 'dev@example.com,test@example.com',
    handlerScript: `function formatContent(jsonObject) {
  return {
    subject: \`图片上传完成 - \${jsonObject.image_name}\`,
    content: \`<h2>图片上传完成</h2>
              <p><strong>图片名:</strong> \${jsonObject.image_name}</p>
              <p><strong>大小:</strong> \${jsonObject.image_size}</p>
              <p><strong>上传时间:</strong> \${jsonObject.upload_time}</p>
              <p><strong>上传者:</strong> \${jsonObject.uploader}</p>\`
  };
}`,
    createUsername: 'admin',
    noticeStatus: NoticeStatusEnum.OPEN,
    createTime: '2024-01-15 10:00:00',
    updateTime: '2024-01-15 10:00:00'
  },
  {
    ruleId: 2,
    ruleName: '图片上传失败通知',
    msgSource: 'image_upload',
    msgType: 'fail',
    noticeMode: NoticeModeEnum.EMAIL,
    noticeAddress: 'dev@example.com',
    handlerScript: `function formatContent(jsonObject) {
  return {
    subject: \`图片上传失败 - \${jsonObject.image_name}\`,
    content: \`<h2>图片上传失败</h2>
              <p><strong>图片名:</strong> \${jsonObject.image_name}</p>
              <p><strong>错误信息:</strong> \${jsonObject.error_message}</p>
              <p><strong>上传者:</strong> \${jsonObject.uploader}</p>\`
  };
}`,
    createUsername: 'admin',
    noticeStatus: NoticeStatusEnum.OPEN,
    createTime: '2024-01-15 10:05:00',
    updateTime: '2024-01-15 10:05:00'
  },
  {
    ruleId: 3,
    ruleName: '系统异常通知',
    msgSource: 'system',
    msgType: 'error',
    noticeMode: NoticeModeEnum.EMAIL,
    noticeAddress: 'admin@example.com,dev@example.com',
    handlerScript: `function formatContent(jsonObject) {
  return {
    subject: \`系统异常 - \${jsonObject.error_message}\`,
    content: \`<h2>系统异常</h2>
              <p><strong>错误信息:</strong> \${jsonObject.error_message}</p>
              <p><strong>错误堆栈:</strong> <pre>\${jsonObject.error_stack}</pre></p>
              <p><strong>发生时间:</strong> \${jsonObject.timestamp}</p>\`
  };
}`,
    createUsername: 'admin',
    noticeStatus: NoticeStatusEnum.CLOSE,
    createTime: '2024-01-15 10:10:00',
    updateTime: '2024-01-15 10:10:00'
  }
]

/**
 * 通知信息列表假数据
 */
export const mockInfos: NoticeInfo[] = [
  {
    infoId: 1,
    msgSource: 'image_upload',
    msgType: 'success',
    noticeContent: '<h2>图片上传完成</h2><p>图片名: photo.jpg</p><p>大小: 2.5MB</p>',
    noticeMode: NoticeModeEnum.EMAIL,
    noticeSuccess: 2,
    noticeTotal: 2,
    noticeTime: '2024-01-15 10:30:00',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-15 10:30:05'
  },
  {
    infoId: 2,
    msgSource: 'image_upload',
    msgType: 'success',
    noticeContent: '<h2>图片上传完成</h2><p>图片名: image.png</p><p>大小: 1.2MB</p>',
    noticeMode: NoticeModeEnum.EMAIL,
    noticeSuccess: 1,
    noticeTotal: 2,
    noticeTime: '2024-01-15 11:00:00',
    createTime: '2024-01-15 11:00:00',
    updateTime: '2024-01-15 11:00:05'
  },
  {
    infoId: 3,
    msgSource: 'image_upload',
    msgType: 'fail',
    noticeContent: '<h2>图片上传失败</h2><p>图片名: large.jpg</p><p>错误: 文件过大</p>',
    noticeMode: NoticeModeEnum.EMAIL,
    noticeSuccess: 1,
    noticeTotal: 1,
    noticeTime: '2024-01-15 11:30:00',
    createTime: '2024-01-15 11:30:00',
    updateTime: '2024-01-15 11:30:05'
  }
]

/**
 * 通知结果明细假数据
 */
export const mockResults: Record<number, NoticeResult[]> = {
  1: [
    {
      id: 1,
      noticeMode: NoticeModeEnum.EMAIL,
      noticeAddress: 'dev@example.com',
      noticeResult: 'success',
      noticeResultTime: '2024-01-15 10:30:05'
    },
    {
      id: 2,
      noticeMode: NoticeModeEnum.EMAIL,
      noticeAddress: 'test@example.com',
      noticeResult: 'success',
      noticeResultTime: '2024-01-15 10:30:06'
    }
  ],
  2: [
    {
      id: 3,
      noticeMode: NoticeModeEnum.EMAIL,
      noticeAddress: 'dev@example.com',
      noticeResult: 'success',
      noticeResultTime: '2024-01-15 11:00:05'
    },
    {
      id: 4,
      noticeMode: NoticeModeEnum.EMAIL,
      noticeAddress: 'test@example.com',
      noticeResult: 'failed',
      noticeResultTime: '2024-01-15 11:00:06'
    }
  ],
  3: [
    {
      id: 5,
      noticeMode: NoticeModeEnum.EMAIL,
      noticeAddress: 'dev@example.com',
      noticeResult: 'success',
      noticeResultTime: '2024-01-15 11:30:05'
    }
  ]
}

/**
 * 模拟 API 延迟
 */
export function delay(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
