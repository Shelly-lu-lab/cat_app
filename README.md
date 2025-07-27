# AI云养猫

一个基于AI技术的虚拟宠物养成网页应用，专为移动端用户设计。

## 功能特性

- 🐱 **AI猫咪生成**：选择品种、年龄、性别，生成个性化猫咪
- 🎬 **AI视频互动**：输入指令，生成猫咪动作视频
- 👤 **用户系统**：邮箱登录，数据同步
- 📱 **移动端优化**：响应式设计，触摸友好
- ☁️ **云端存储**：基于Supabase的数据存储

## 技术栈

- **前端**：React 18 + TypeScript + Vite
- **样式**：Tailwind CSS
- **状态管理**：Zustand
- **路由**：React Router v6
- **后端**：Supabase (数据库 + 认证 + 存储)
- **AI服务**：通义万相2.1-文生图-Plus + 通义万相2.1-图生视频-Plus

## 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 环境配置
1. 复制 `env.example` 为 `.env.local`
2. 配置以下环境变量：
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_TONGYI_API_KEY=your_tongyi_api_key
   ```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 项目结构

```
src/
├── components/          # 可复用组件
│   ├── ui/             # 基础UI组件
│   ├── auth/           # 认证相关组件
│   ├── cat/            # 猫咪相关组件
│   └── video/          # 视频相关组件
├── pages/              # 页面组件
├── hooks/              # 自定义Hooks
├── services/           # API服务
│   ├── ai/             # AI服务（通义万相）
│   ├── supabase/       # Supabase服务
│   └── storage/        # 存储服务
├── stores/             # 状态管理
├── types/              # TypeScript类型定义
├── utils/              # 工具函数
└── styles/             # 样式文件
```

## 开发计划

### 第一阶段：项目初始化 ✅
- [x] 项目基础架构搭建
- [x] 移动端优化配置
- [x] 基础组件开发

### 第二阶段：用户认证
- [ ] Supabase Auth集成
- [ ] 登录/注册页面
- [ ] 路由保护

### 第三阶段：猫咪生成
- [ ] 通义万相API集成
- [ ] 猫咪选择界面
- [ ] 图片生成功能

### 第四阶段：视频互动
- [ ] 视频生成API
- [ ] 指令输入界面
- [ ] 视频播放功能

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交 Issue 或联系开发团队。
