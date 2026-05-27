# 方案 B：前端静态发布 + 后端 API 单独部署

该方案可以实现 build 后通过链接访问，并且 GET/POST 请求走线上 API。

## 一、整体结构

```text
用户浏览器
  ↓
前端静态站点：GitHub Pages / Vercel / Netlify / Nginx
  ↓
线上 API：云服务器 / Render / Railway / 其他 Node 平台
```

前端只发布 `dist/` 静态文件，API 单独运行 JSON Server。

## 二、API 部署

### 方式 1：云服务器

服务器安装 Node.js 和 pnpm 后，上传项目代码，执行：

```bash
pnpm install
pnpm api
```

API 默认监听：

```text
0.0.0.0:3001
```

服务器需要放行 3001 端口。访问示例：

```text
http://服务器IP:3001/buildings
```

如果有域名和反向代理，建议映射为：

```text
https://api.example.com
```

### 方式 2：Render / Railway

构建命令：

```bash
pnpm install
```

启动命令示例：

```bash
pnpm exec json-server db.json --host 0.0.0.0 --port 3001
```

如果平台要求使用动态端口，启动命令改为平台支持的端口变量，例如 Render 常用：

```bash
pnpm exec json-server db.json --host 0.0.0.0 --port $PORT
```

部署完成后，记录 API 域名，例如：

```text
https://campus-energy-api.onrender.com
```

## 三、前端部署

### Vercel / Netlify

构建命令：

```bash
pnpm build
```

输出目录：

```text
dist
```

环境变量：

```text
VITE_API_BASE_URL=https://你的API域名
VITE_BASE_PATH=/
```

### GitHub Pages

如果仓库名是 `campus-energy-dashboard`，线上地址通常是：

```text
https://用户名.github.io/campus-energy-dashboard/
```

构建前设置：

```text
VITE_API_BASE_URL=https://你的API域名
VITE_BASE_PATH=/campus-energy-dashboard/
```

然后执行：

```bash
pnpm build
```

把 `dist/` 发布到 GitHub Pages。

## 四、上线后验证

前端链接打开后检查：

- 首页统计卡片是否有数据。
- 折线图、柱状图、饼图是否正常显示。
- 教学楼详情页是否能打开。
- 综合分析页提交巡检记录是否成功。

API 链接单独检查：

```text
https://你的API域名/buildings
https://你的API域名/dailyEnergy
https://你的API域名/inspections
```

POST 验证：

```bash
curl -X POST https://你的API域名/inspections \
  -H "Content-Type: application/json" \
  -d "{\"buildingId\":1,\"buildingName\":\"第一教学楼\",\"type\":\"综合巡检\",\"content\":\"线上接口测试\",\"createdAt\":\"2026-05-27 15:00\"}"
```

## 五、注意事项

- JSON Server 适合作业演示和模拟接口，不建议作为正式生产后端。
- 如果前端是 HTTPS，API 也应使用 HTTPS，否则浏览器可能拦截请求。
- API 平台需要允许跨域访问。JSON Server 默认会返回 CORS 相关响应头，通常可以直接访问。
- 免费云平台可能会休眠，第一次打开接口可能较慢。
