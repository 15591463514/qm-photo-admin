import { AppRouteRecord } from '@/types/router'

export const sourceRoutes: AppRouteRecord = {
  path: '/source',
  name: 'Source',
  component: '/index/index',
  meta: {
    title: '资源管理',
    icon: 'ri:folder-image-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'image',
      name: 'ImageUpload',
      component: '/source/image',
      meta: {
        title: '图片上传',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'address',
      name: 'Address',
      component: '/source/address',
      meta: {
        title: '地址管理',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'tag',
      name: 'Tag',
      component: '/source/tag',
      meta: {
        title: '标签管理',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    }
  ]
}
