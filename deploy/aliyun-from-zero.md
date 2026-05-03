# 阿里云从 0 部署指南（含 PostgreSQL 安装）

这份文档是给当前项目准备的，假设你：

1. 不懂部署
2. 还没有域名
3. 阿里云服务器上已经跑着一个旧项目
4. 服务器上还没有安装 PostgreSQL
5. 想把聊天项目也部署上去，但不影响原来的项目

本方案使用：

1. 原项目继续保留
2. 聊天项目前端挂在 `http://服务器IP/chat/`
3. 聊天项目后端挂在 `http://服务器IP/chat-api/`
4. 聊天后端使用 `3001` 端口
5. PostgreSQL 安装在当前服务器本机
6. `Nginx + pm2 + Node.js + PostgreSQL`

## 一、最终效果

部署完成后：

1. 原项目：`http://你的服务器IP/`
2. 聊天项目前端：`http://你的服务器IP/chat/`
3. 聊天项目接口：`http://你的服务器IP/chat-api/`

## 二、先理解部署思路

你的服务器上现在已经有一个项目：

1. 原项目页面走 `/`
2. 原项目接口走 `/api`
3. 原项目后端占用了 `3000`

所以聊天项目不能：

1. 再占 `3000`
2. 再占 `/`
3. 再占 `/api`

因此我们选择：

1. 聊天后端改用 `3001`
2. 聊天前端走 `/chat/`
3. 聊天接口走 `/chat-api/`
4. PostgreSQL 本机安装，但只监听本机或默认配置即可

## 三、登录服务器

本地执行：

```bash
ssh admin@你的服务器IP
```

## 四、安装基础软件

### 1. 更新系统包

```bash
sudo apt update
```

### 2. 安装 git、nginx、curl

```bash
sudo apt install -y git nginx curl
```

### 3. 安装 Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 4. 安装 pnpm 和 pm2

```bash
sudo npm install -g pnpm pm2
```

### 5. 检查版本

```bash
node -v
pnpm -v
pm2 -v
nginx -v
git --version
```

## 五、安装 PostgreSQL

### 1. 安装 PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
```

### 2. 启动 PostgreSQL

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3. 检查状态

```bash
sudo systemctl status postgresql
```

如果看到 `active (running)`，说明 PostgreSQL 正常。

## 六、创建数据库和用户

### 1. 进入 PostgreSQL 控制台

```bash
sudo -u postgres psql
```

进入后会看到类似：

```text
postgres=#
```

### 2. 创建数据库用户

在 `psql` 里执行：

```sql
CREATE USER chat_user WITH PASSWORD '123456';
```

你也可以把密码改成更复杂的。

### 3. 创建数据库

```sql
CREATE DATABASE chat_backend OWNER chat_user;
```

### 4. 给权限

```sql
GRANT ALL PRIVILEGES ON DATABASE chat_backend TO chat_user;
```

### 5. 退出 psql

```sql
\q
```

## 七、验证 PostgreSQL 是否可连接

执行：

```bash
psql -h 127.0.0.1 -U chat_user -d chat_backend
```

会提示输入密码，输入你刚刚设置的密码。

如果成功进入，说明数据库没问题。

退出：

```sql
\q
```

## 八、把项目上传到服务器

你有两种方式。

### 方法 A：GitHub 仓库方式

```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone 你的仓库地址 chat-project
sudo chown -R admin:admin /var/www/chat-project
```

### 方法 B：本地压缩上传

本地执行：

```bash
tar -czf chat-project.tar.gz chat-project
scp chat-project.tar.gz admin@你的服务器IP:/home/admin/
```

服务器执行：

```bash
sudo mkdir -p /var/www
sudo mv /home/admin/chat-project.tar.gz /var/www/
cd /var/www
tar -xzf chat-project.tar.gz
sudo chown -R admin:admin /var/www/chat-project
```

## 九、配置后端环境变量

进入后端目录：

```bash
cd /var/www/chat-project/apps/server
```

创建 `.env`：

```bash
cat > .env <<'EOF'
PORT=3001
JWT_SECRET=replace-with-a-secure-random-secret
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USERNAME=chat_user
DB_PASSWORD=123456
DB_DATABASE=chat_backend
DB_SYNCHRONIZE=true
EOF
```

### 关于 `DB_SYNCHRONIZE`

第一次部署时，为了让表自动创建，可以先临时用：

```env
DB_SYNCHRONIZE=true
```

确认项目运行成功后，建议改回：

```env
DB_SYNCHRONIZE=false
```

然后重启后端。

## 十、配置前端环境变量

进入前端目录：

```bash
cd /var/www/chat-project/apps/web
```

创建 `.env.production`：

```bash
cat > .env.production <<'EOF'
VITE_APP_BASE_PATH=/chat/
VITE_ROUTER_BASE_PATH=/chat/
VITE_API_BASE_URL=http://你的服务器IP/chat-api
VITE_SOCKET_PATH=/chat-api/socket.io
EOF
```

把 `你的服务器IP` 替换成你自己的服务器公网 IP。

例如：

```bash
cat > .env.production <<'EOF'
VITE_APP_BASE_PATH=/chat/
VITE_ROUTER_BASE_PATH=/chat/
VITE_API_BASE_URL=http://47.xx.xx.xx/chat-api
VITE_SOCKET_PATH=/chat-api/socket.io
EOF
```

## 十一、安装依赖并构建后端

```bash
cd /var/www/chat-project/apps/server
pnpm install
pnpm build
```

## 十二、安装依赖并构建前端

```bash
cd /var/www/chat-project/apps/web
pnpm install
pnpm build
```

构建结果会在：

```bash
/var/www/chat-project/apps/web/dist
```

## 十三、用 pm2 启动后端

```bash
cd /var/www/chat-project/apps/server
pm2 start dist/main.js --name chat-server --cwd /var/www/chat-project/apps/server
pm2 save
```

查看状态：

```bash
pm2 status
```

查看日志：

```bash
pm2 logs chat-server
```

设置开机自启：

```bash
pm2 startup
```

执行后终端会打印一条命令，你再复制执行一次。

## 十四、修改 Nginx 配置

你当前已有配置文件：

```bash
/etc/nginx/sites-enabled/reddate-admin
```

我们是在原配置基础上追加聊天项目，而不是替换原项目。

### 1. 先备份

```bash
sudo cp /etc/nginx/sites-enabled/reddate-admin /etc/nginx/sites-enabled/reddate-admin.bak
```

### 2. 直接覆盖配置文件

不用 `nano`，直接执行下面这条命令即可整体替换：

```bash
sudo cat > /etc/nginx/sites-enabled/reddate-admin <<'EOF'
server {
    listen 80;
    server_name _;

    root /var/www/reddate-admin/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /var/www/reddate-admin/server/uploads;
    }

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
}
EOF
```

### 3. 检查配置

```bash
sudo nginx -t
```

如果看到：

```bash
syntax is ok
test is successful
```

说明配置没问题。

### 4. 重载 Nginx

```bash
sudo systemctl reload nginx
```

## 十五、访问项目

### 原项目

```text
http://你的服务器IP/
```

### 聊天项目前端

```text
http://你的服务器IP/chat/
```

## 十六、首次访问后要做什么

重点测试：

1. `/chat/` 页面能否打开
2. 能否注册
3. 能否登录
4. 能否搜索用户
5. 能否发送好友申请
6. 能否双端聊天
7. WebSocket 是否正常
8. 设置页是否能访问
9. 夜间模式是否正常

## 十七、常见问题排查

### 1. 前端白页

检查：

1. 前端是否重新 build 过
2. `.env.production` 是否正确
3. Nginx 的 `/chat/` 是否写对

### 2. 接口报错

先看后端日志：

```bash
pm2 logs chat-server
```

### 3. 数据库连不上

执行：

```bash
psql -h 127.0.0.1 -U chat_user -d chat_backend
```

如果连不上，说明 PostgreSQL 用户、数据库或密码有问题。

### 4. Socket.IO 不通

检查：

1. `VITE_SOCKET_PATH=/chat-api/socket.io`
2. Nginx 是否有 `/chat-api/socket.io/` 代理
3. 后端是否正常运行在 `3001`

### 5. 3001 没启动

执行：

```bash
sudo lsof -i -P -n | grep 3001
```

如果没输出，说明后端没跑起来。

### 6. 看 pm2 状态

```bash
pm2 status
```

## 十八、常用命令汇总

### 检查 nginx

```bash
sudo nginx -t
```

### 重载 nginx

```bash
sudo systemctl reload nginx
```

### 看后端状态

```bash
pm2 status
```

### 看后端日志

```bash
pm2 logs chat-server
```

### 看 PostgreSQL 状态

```bash
sudo systemctl status postgresql
```

### 看 3001 端口

```bash
sudo lsof -i -P -n | grep 3001
```

## 十九、部署顺序总结

照这个顺序做最稳：

1. 登录服务器
2. 安装 `git nginx node pnpm pm2 postgresql`
3. 创建 PostgreSQL 用户和数据库
4. 上传项目到 `/var/www/chat-project`
5. 配后端 `.env`
6. 配前端 `.env.production`
7. 构建后端
8. 构建前端
9. `pm2` 启动后端
10. 修改 Nginx
11. `sudo nginx -t`
12. `sudo systemctl reload nginx`
13. 浏览器打开 `/chat/`

## 二十、第一次部署最容易出错的地方

1. 后端仍然用了 `3000`
2. `.env.production` 里写成了 `localhost`
3. 没有安装 PostgreSQL
4. PostgreSQL 用户和数据库没创建
5. `DB_SYNCHRONIZE` 配置不对
6. 改了 Nginx 却忘了 reload
7. 前端改了环境变量却没重新 build
8. Socket.IO 路径没配对

## 二十一、后面建议

等你把项目跑起来后，下一步建议做：

1. 买域名
2. 配 HTTPS
3. 把 `DB_SYNCHRONIZE` 改回 `false`
4. 后续补 migration
5. 增加 Docker 部署方式

## 二十二、你接下来怎么用我

你现在可以一边照着做，一边把命令输出发给我。

如果卡住，把下面任意内容发给我：

1. `pnpm build` 报错
2. `pm2 logs chat-server` 输出
3. `sudo nginx -t` 输出
4. `sudo systemctl status postgresql` 输出
5. 浏览器打开 `/chat/` 的现象

我可以继续一步一步带你排查。
