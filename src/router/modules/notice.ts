import { AppRouteRecord } from '@/types/router'

export const noticeRoutes: AppRouteRecord = {
  path: '/notice',
  name: 'Notice',
  component: '/index/index',
  meta: {
    title: '通知管理',
    icon: 'ri:notification-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'rules',
      name: 'NoticeRules',
      component: '/notice/rules',
      meta: {
        title: '规则管理',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN'],
        authList: [
          { title: '新增', authMark: 'notice:rules:add' },
          { title: '编辑', authMark: 'notice:rules:edit' },
          { title: '删除', authMark: 'notice:rules:delete' }
        ]
      }
    },
    {
      path: 'infos',
      name: 'NoticeInfos',
      component: '/notice/infos',
      meta: {
        title: '信息管理',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN'],
        authList: [
          { title: '查看', authMark: 'notice:infos:view' },
          { title: '删除', authMark: 'notice:infos:delete' }
        ]
      }
    }
  ]
}
