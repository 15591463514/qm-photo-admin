/**
 * 头像工具函数
 *
 * 根据用户头像和性别返回正确的头像URL
 *
 * @module utils/avatar
 */

import { Gender } from '@/constants/gender'

// 导入默认头像图片
import avatarBoy from '@/assets/images/avatar/avatar-boy.jpeg'
import avatarGirl from '@/assets/images/avatar/avatar-girl.jpeg'
import avatarUnknown from '@/assets/images/avatar/avatar-unknown.jpeg'

/**
 * 根据用户头像和性别获取头像URL
 *
 * @param avatar - 用户头像URL（可能为空）
 * @param gender - 用户性别：'male' | 'female' | 'unknown'
 * @returns 头像URL
 *
 * @example
 * ```ts
 * // 有头像时使用用户头像
 * getAvatarUrl('https://example.com/avatar.jpg', 'male')
 * // => 'https://example.com/avatar.jpg'
 *
 * // 无头像时根据性别使用默认头像
 * getAvatarUrl(null, 'male')
 * // => avatarBoy (导入的图片路径)
 *
 * getAvatarUrl('', 'female')
 * // => avatarGirl (导入的图片路径)
 *
 * getAvatarUrl(undefined, 'unknown')
 * // => avatarUnknown (导入的图片路径)
 * ```
 */
export function getAvatarUrl(
  avatar: string | null | undefined,
  gender?: Gender | string | null
): string {
  // 如果用户有头像，直接使用
  if (avatar && avatar.trim()) {
    return avatar
  }

  // 根据性别返回默认头像
  const genderValue = gender || Gender.UNKNOWN

  switch (genderValue) {
    case Gender.MALE:
      return avatarBoy
    case Gender.FEMALE:
      return avatarGirl
    case Gender.UNKNOWN:
    default:
      return avatarUnknown
  }
}
