# Chat Project

一个前后端分离的即时聊天项目，当前已经具备注册登录、好友申请、好友管理、实时私聊、消息持久化与会话查询能力。

## 技术栈

- 前端：Vue 3、Vite、TypeScript、Tailwind CSS、Vue Router、Socket.IO Client
- 后端：NestJS、TypeORM、PostgreSQL、JWT、Socket.IO

## 当前能力

- 用户注册、登录、获取个人资料
- JWT 鉴权保护接口和实时连接
- 按用户名或邮箱搜索用户并发起好友申请
- 好友申请、接受、拒绝、删除好友
- 单聊消息实时收发
- 消息持久化存储与历史会话查询
- 会话按最近消息排序，支持本地未读消息计数与会话搜索
- 历史消息支持按时间游标分页加载
- 支持在线状态展示与消息已读回执

## 目录结构

```text
chat-project/
  apps/
    web/     # Vue 3 + Vite 前端
    server/  # NestJS + PostgreSQL 后端
```

## 环境变量

### 前端

复制 `apps/web/.env.example` 为 `apps/web/.env`：

```env
VITE_APP_BASE_PATH=/
VITE_ROUTER_BASE_PATH=/
VITE_API_BASE_URL=http://localhost:3000
VITE_SOCKET_PATH=/socket.io
```

### 后端

复制 `apps/server/.env.example` 为 `apps/server/.env`：

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

## 本地开发

### 前端

```bash
cd apps/web
pnpm install
pnpm dev
```

### 后端

```bash
cd apps/server
pnpm install
pnpm start:dev
```

## 构建验证

- 前端：`pnpm build`
- 后端：`pnpm build`

## 无域名部署

如果暂时没有域名，可以把聊天项目挂在服务器 IP 的子路径下：

- 前端：`http://服务器IP/chat/`
- 后端接口：`http://服务器IP/chat-api/`

前端生产环境变量可参考 `apps/web/.env.production.ip.example`。

Nginx 示例：

```nginx
location /chat/ {
    alias /var/www/chat-project/apps/web/dist/;
    try_files $uri $uri/ /chat/index.html;
}

location /chat-api/ {
    proxy_pass http://127.0.0.1:3001/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_cache_bypass $http_upgrade;
}

location /chat-api/socket.io/ {
    proxy_pass http://127.0.0.1:3001/socket.io/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_cache_bypass $http_upgrade;
}
```

## 已完成的项目补强

- 新增用户搜索加好友流程，替代输入用户 ID 的开发态交互
- 新增会话最近消息排序、未读数展示与会话搜索
- 新增历史消息分页、在线状态与已读回执
- 前后端基础配置改为环境变量读取，减少硬编码
- 移除对外裸露的用户增删改查接口，仅保留受保护的搜索接口
