# Supabase + Vercel 部署流程

该项目推荐使用：

```text
前端：Vercel
后端数据 API：Supabase
```

Supabase 会自动提供 REST API，前端通过 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 请求数据。

## 一、创建 Supabase 项目

1. 打开 Supabase：

```text
https://supabase.com
```

2. 登录后点击：

```text
New project
```

3. 填写项目名称、数据库密码、区域，然后创建项目。

## 二、导入数据库表和数据

进入 Supabase 项目后，打开：

```text
SQL Editor -> New query
```

复制本项目中的 SQL 文件内容：

```text
supabase/schema.sql
```

粘贴到 Supabase SQL Editor，然后点击：

```text
Run
```

执行成功后，会创建这些表：

```text
buildings
daily_energy
monthly_energy
inspections
```

并自动插入演示数据。

## 三、获取 Supabase API 配置

打开：

```text
Project Settings -> API
```

复制：

```text
Project URL
anon public key
```

示例：

```text
Project URL: https://abcdefghijk.supabase.co
anon public key: eyJhbGciOi...
```

注意：只能使用 `anon public key`，不要把 `service_role` key 填到前端。

## 四、配置 Vercel 前端

打开 Vercel 项目：

```text
Project -> Settings -> Environment Variables
```

添加：

```text
VITE_SUPABASE_URL=https://你的项目.supabase.co
VITE_SUPABASE_ANON_KEY=你的 anon public key
VITE_BASE_PATH=/
```

如果之前配置了这个变量，可以清空或删除：

```text
VITE_API_BASE_URL
```

本项目优先使用 Supabase 配置；只有没有 Supabase 配置时，才回退到 JSON Server。

## 五、重新部署 Vercel

Vercel 环境变量是在构建阶段写入的，所以修改变量后必须重新部署。

进入：

```text
Deployments -> 选择最新部署 -> Redeploy
```

部署完成后，打开 Vercel 项目链接。

## 六、验证是否成功

打开浏览器开发者工具：

```text
F12 -> Network
```

刷新页面。正确请求地址应该类似：

```text
https://你的项目.supabase.co/rest/v1/buildings
https://你的项目.supabase.co/rest/v1/daily_energy
https://你的项目.supabase.co/rest/v1/monthly_energy
https://你的项目.supabase.co/rest/v1/inspections
```

如果综合分析页提交巡检记录成功，说明 POST 也正常。

## 七、本地开发

本地仍然可以继续使用 JSON Server：

```bash
pnpm api
pnpm dev
```

本地默认请求：

```text
http://localhost:3001
```

如果你想本地也连接 Supabase，可以新建 `.env.local`：

```text
VITE_SUPABASE_URL=https://你的项目.supabase.co
VITE_SUPABASE_ANON_KEY=你的 anon public key
VITE_BASE_PATH=/
```

然后重新运行：

```bash
pnpm dev
```
