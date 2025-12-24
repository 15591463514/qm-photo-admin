# Token 刷新机制文档

本文档详细说明了前端项目中 Token 过期后使用 RefreshToken 自动刷新 AccessToken 的完整流程和实现机制。

## 目录

- [概述](#概述)
- [当前状态](#当前状态)
- [刷新流程](#刷新流程)
- [实现细节](#实现细节)
- [关键点说明](#关键点说明)
- [特殊情况处理](#特殊情况处理)
- [流程图](#流程图)

---

## 概述

### Token 类型

1. **AccessToken（访问令牌）**
   - 用于 API 请求的身份验证
   - 有效期较短（通常为几小时）
   - 存储在 `userStore.accessToken` 中
   - 每次请求时自动添加到 `Authorization` 请求头

2. **RefreshToken（刷新令牌）**
   - 用于刷新 AccessToken
   - 有效期较长（通常为 7 天）
   - 存储在 `userStore.refreshToken` 中
   - 仅在 AccessToken 过期时使用

### 为什么需要 RefreshToken？

- **安全性**：AccessToken 有效期短，即使泄露影响范围有限
- **用户体验**：无需频繁登录，自动刷新 Token
- **性能**：减少数据库查询，通过 RefreshToken 验证用户身份

---

## 当前状态

### 登录流程

1. 用户登录成功后，后端返回：

   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   ```

2. 前端存储到 `userStore`：

   ```typescript
   userStore.setToken(token, refreshToken)
   ```

3. 请求拦截器自动添加 Token：
   ```typescript
   request.headers.set('Authorization', `Bearer ${accessToken}`)
   ```

### 当前 401 处理

- 遇到 401 错误时，直接调用 `logOut()` 退出登录
- **问题**：没有尝试刷新 Token，用户体验不佳

---

## 刷新流程

### 完整流程步骤

```
1. 用户发起 API 请求
   ↓
2. 请求拦截器添加 AccessToken
   ↓
3. 后端验证 Token 过期，返回 401
   ↓
4. 响应拦截器检测到 401 错误
   ↓
5. 检查是否有 refreshToken
   ├─ 无 refreshToken → 直接退出登录
   └─ 有 refreshToken → 进入刷新流程
   ↓
6. 检查是否正在刷新（防止并发）
   ├─ 正在刷新 → 加入请求队列，等待刷新完成
   └─ 未在刷新 → 执行刷新操作
   ↓
7. 调用刷新接口 POST /api/auth/refresh
   ↓
8. 刷新结果判断
   ├─ 成功 → 更新 AccessToken → 重试原始请求
   └─ 失败 → 退出登录
```

### 刷新接口说明

**接口地址：** `POST /api/auth/refresh`

**请求体：**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**成功响应：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "新的 AccessToken"
  }
}
```

**失败响应：**

```json
{
  "code": 401,
  "message": "Refresh Token 无效或已过期"
}
```

---

## 实现细节

### 1. 刷新锁机制

**目的：** 防止多个请求同时触发刷新操作

**实现方式：**

```typescript
let isRefreshing = false // 是否正在刷新
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (error?: any) => void
  config: AxiosRequestConfig
}> = [] // 失败请求队列
```

**工作流程：**

- 第一个 401 请求：设置 `isRefreshing = true`，开始刷新
- 后续 401 请求：检测到 `isRefreshing = true`，加入队列等待
- 刷新完成：重置 `isRefreshing = false`，批量重试队列中的请求

### 2. 请求队列管理

**队列结构：**

```typescript
interface QueuedRequest {
  resolve: (value?: any) => void // Promise resolve 函数
  reject: (error?: any) => void // Promise reject 函数
  config: AxiosRequestConfig // 原始请求配置
}
```

**队列操作：**

- **入队**：401 请求在刷新期间加入队列
- **出队**：刷新成功后，批量处理队列中的请求
- **清空**：刷新失败时，清空队列并退出登录

### 3. Token 更新

**更新位置：** `userStore.setToken(newAccessToken)`

**注意事项：**

- 只更新 `accessToken`，`refreshToken` 保持不变
- 更新后立即重试原始请求

### 4. 请求重试

**重试方式：**

```typescript
// 更新请求头中的 Token
config.headers.set('Authorization', `Bearer ${newAccessToken}`)

// 重新发送请求
return axiosInstance.request(config)
```

**批量重试：**

```typescript
failedQueue.forEach(({ resolve, reject, config }) => {
  config.headers.set('Authorization', `Bearer ${newAccessToken}`)
  axiosInstance.request(config).then(resolve).catch(reject)
})
```

---

## 关键点说明

### 1. 防止并发刷新

**问题场景：**

- 用户同时发起多个请求
- 所有请求都返回 401
- 如果不加锁，会触发多次刷新请求

**解决方案：**

- 使用 `isRefreshing` 标志位
- 第一个请求触发刷新，其他请求等待
- 刷新完成后，统一重试所有请求

### 2. 请求队列管理

**队列的作用：**

- 存储刷新期间失败的请求
- 刷新成功后批量重试
- 刷新失败时统一处理（退出登录）

**队列的生命周期：**

```
请求失败 → 加入队列 → 刷新成功 → 批量重试 → 清空队列
                ↓
            刷新失败 → 清空队列 → 退出登录
```

### 3. 刷新接口的特殊处理

**注意事项：**

- 刷新接口本身不应该触发刷新流程（避免死循环）
- 刷新接口失败时，直接退出登录
- 刷新接口不需要添加 Authorization 头（使用 refreshToken）

### 4. Token 存储

**存储位置：**

- `userStore.accessToken`：访问令牌
- `userStore.refreshToken`：刷新令牌

**持久化：**

- 使用 Pinia 的 `persist` 插件
- 存储在 `localStorage` 中
- 退出登录时自动清除

---

## 特殊情况处理

### 1. 刷新接口返回 401

**场景：** RefreshToken 也过期了

**处理方式：**

- 直接退出登录
- 清空请求队列
- 提示用户重新登录

### 2. 刷新期间新请求

**场景：** 刷新进行中，用户又发起了新请求

**处理方式：**

- 新请求加入队列
- 等待刷新完成后统一重试
- 如果刷新失败，队列中的请求也会失败

### 3. 刷新超时

**场景：** 刷新接口响应时间过长

**处理方式：**

- 设置合理的超时时间（如 10 秒）
- 超时视为刷新失败
- 退出登录

### 4. 无 RefreshToken

**场景：** 用户首次登录或 RefreshToken 已清除

**处理方式：**

- 直接退出登录
- 不尝试刷新
- 提示用户重新登录

### 5. 刷新接口网络错误

**场景：** 刷新接口调用失败（网络问题）

**处理方式：**

- 视为刷新失败
- 退出登录
- 提示用户检查网络连接

---

## 流程图

### 完整流程图

```
┌─────────────────┐
│  用户发起请求    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 请求拦截器添加  │
│   AccessToken   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   发送请求      │
└────────┬────────┘
         │
         ▼
    ┌────────┐
    │ 401?   │
    └───┬────┘
        │
    ┌───┴───┐
    │ 是    │  否
    │       └───► 正常返回
    ▼
┌─────────────────┐
│ 检查refreshToken│
└────────┬────────┘
         │
    ┌────┴────┐
    │ 有      │  无
    │         └───► 退出登录
    ▼
┌─────────────────┐
│ 检查是否在刷新  │
└────────┬────────┘
         │
    ┌────┴────┐
    │ 是      │  否
    │         │
    │         ▼
    │   ┌──────────────┐
    │   │ 设置刷新标志 │
    │   │ isRefreshing │
    │   └──────┬───────┘
    │          │
    │          ▼
    │   ┌──────────────┐
    │   │ 调用刷新接口  │
    │   └──────┬───────┘
    │          │
    │     ┌────┴────┐
    │     │ 成功    │  失败
    │     │         └───► 退出登录
    │     ▼
    │ ┌──────────────┐
    │ │ 更新Token    │
    │ └──────┬───────┘
    │        │
    │        ▼
    │ ┌──────────────┐
    │ │ 重试原始请求 │
    │ └──────────────┘
    │
    ▼
┌─────────────────┐
│ 加入请求队列    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 等待刷新完成    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 批量重试队列    │
│   中的请求      │
└─────────────────┘
```

### 并发请求处理流程图

```
时间线：
T1: 请求A → 401 → 开始刷新
T2: 请求B → 401 → 加入队列
T3: 请求C → 401 → 加入队列
T4: 刷新完成 → 更新Token
T5: 重试请求A、B、C
```

---

## 代码实现位置

### 主要文件

1. **HTTP 拦截器**
   - 文件：`src/utils/http/index.ts`
   - 功能：请求拦截、响应拦截、刷新逻辑

2. **用户 Store**
   - 文件：`src/store/modules/user.ts`
   - 功能：Token 存储、更新、清除

3. **认证 API**
   - 文件：`src/api/auth.ts`
   - 功能：刷新接口调用

### 关键函数

- `handleUnauthorizedError()`: 处理 401 错误
- `refreshAccessToken()`: 刷新 Token
- `retryRequest()`: 重试请求
- `processQueue()`: 处理请求队列

---

## 测试场景

### 1. 正常刷新流程

- AccessToken 过期
- 有有效的 RefreshToken
- 刷新成功，请求重试成功

### 2. RefreshToken 过期

- AccessToken 过期
- RefreshToken 也过期
- 刷新失败，退出登录

### 3. 并发请求

- 多个请求同时返回 401
- 只触发一次刷新
- 所有请求在刷新后重试

### 4. 刷新期间新请求

- 刷新进行中
- 新请求加入队列
- 刷新完成后统一重试

### 5. 网络错误

- 刷新接口调用失败
- 退出登录
- 提示用户

---

## 注意事项

1. **避免死循环**
   - 刷新接口本身不应该触发刷新流程
   - 刷新接口需要特殊标记，跳过刷新逻辑

2. **错误处理**
   - 所有可能的错误情况都要处理
   - 给用户明确的错误提示

3. **性能优化**
   - 请求队列不要无限增长
   - 设置合理的超时时间

4. **安全性**
   - RefreshToken 不要暴露在日志中
   - 刷新失败后立即清除所有 Token

---

## 更新日志

- **2024-XX-XX**: 创建文档，记录 Token 刷新机制流程

---

## 相关文档

- [前端插件与公共组件文档](./前端插件与公共组件文档.md)
- [用户 Store 模块说明](../src/store/modules/user.ts)
