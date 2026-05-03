# Chat Server

NestJS 聊天后端，负责鉴权、用户搜索、好友关系管理、消息持久化和实时通信。

## 环境变量

复制 `.env.example` 为 `.env`：

```env
PORT=3000
JWT_SECRET=replace-with-a-secure-secret
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=chat_user
DB_PASSWORD=123456
DB_DATABASE=chat_backend
DB_SYNCHRONIZE=true
```

## 脚本

- `pnpm start:dev`
- `pnpm build`
- `pnpm test`
- `pnpm test:e2e`

## 当前接口与能力

- `POST /auth/register` 注册
- `POST /auth/login` 登录
- `GET /auth/profile` 获取当前用户资料
- `GET /users/search` 搜索用户
- `POST /friends/request` 发起好友申请
- `PATCH /friends/request/:id/accept` 接受申请
- `PATCH /friends/request/:id/reject` 拒绝申请
- `GET /friends` 获取好友列表
- `GET /friends/requests/pending` 获取待处理申请
- `DELETE /friends/:friendId` 删除好友
- `GET /messages/conversation/:userId` 获取会话历史
- `GET /messages/conversation/:userId?before=<ISO 时间>&limit=20` 分页获取更早消息
- Socket.IO `chat:send` / `chat:message` 实时聊天
- Socket.IO `chat:read` 已读回执同步
- Socket.IO `presence:update` 在线状态同步

## 当前工程约束

- 用户搜索接口受 JWT 保护
- 用户公开 CRUD 已移除，避免未授权暴露
- 数据库与服务配置通过环境变量注入
