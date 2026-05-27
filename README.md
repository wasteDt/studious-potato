# 校园水电能耗可视化平台

面向学校后勤管理场景的 Vue 3 可视化系统，用于展示教学楼用电量、用水量、能耗趋势、占比和巡检记录。

## 技术栈

- Vue 3 + Vite
- Vue Router
- ECharts
- Axios
- JSON Server
- pnpm

## 本地运行

安装依赖：

```bash
pnpm install
```

启动模拟 API：

```bash
pnpm api
```

启动前端：

```bash
pnpm dev
```

访问地址：

```text
http://localhost:5173
```

模拟 API 地址：

```text
http://localhost:3001
```

生产构建：

```bash
pnpm build
```

## 核心功能

- 多页面路由：总览页、教学楼列表、教学楼详情、用电分析、用水分析、综合分析。
- 数据可视化：折线图展示趋势，柱状图展示教学楼对比，饼图展示占比。
- 模拟 API 请求：通过 JSON Server 提供教学楼、日能耗、月能耗、巡检记录数据。
- HTTP GET：页面加载时获取楼宇和能耗数据。
- HTTP POST：综合分析页可提交巡检记录到 `/inspections`。
- 加载状态：页面请求期间显示加载状态，提交巡检记录时显示提交中状态。

## 性能优化

- 路由懒加载：各业务页面通过 `() => import()` 按需加载。
- ECharts 生命周期管理：图表组件挂载时初始化，卸载时执行 `dispose()`。
- 接口缓存：GET 请求结果在前端缓存 5 分钟，减少重复请求。
- ECharts 按需引入：只注册折线图、柱状图、饼图及必要组件。

## 线上部署

推荐使用 Supabase + Vercel：

- Supabase：提供稳定免费的在线 REST API 和数据库。
- Vercel：发布前端静态页面。

详细步骤见 [DEPLOYMENT.md](./DEPLOYMENT.md)。

Vercel 需要配置：

```text
VITE_SUPABASE_URL=https://你的项目.supabase.co
VITE_SUPABASE_ANON_KEY=你的 anon public key
VITE_BASE_PATH=/
```

数据库建表和初始化数据见：

```text
supabase/schema.sql
```

## 浏览器兼容测试方案

建议测试以下主流浏览器：

- Chrome 最新版
- Microsoft Edge 最新版
- Firefox 最新版

测试内容：

- 页面路由是否正常跳转。
- 总览页和详情页图表是否正常渲染。
- 教学楼列表搜索、排序是否正常。
- 综合分析页巡检记录 POST 提交是否成功。
- 页面在 1366px、1024px、移动端宽度下是否无明显布局错位。

构建兼容目标由 Vite 处理，当前生产构建目标包含 `chrome87`、`edge88`、`firefox78`、`safari14` 及以上环境。
