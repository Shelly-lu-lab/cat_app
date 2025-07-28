# Supabase Storage 配置指南

## 问题描述

当前遇到的问题是Supabase Storage的Row Level Security (RLS)策略阻止了文件上传操作。错误信息：
```
new row violates row-level security policy
```

## 解决方案

### 1. 创建Storage Buckets

在Supabase Dashboard中创建以下Storage buckets：

#### 创建 `cat-images` bucket
1. 进入Supabase Dashboard
2. 导航到 Storage > Buckets
3. 点击 "New bucket"
4. 设置：
   - Name: `cat-images`
   - Public bucket: ✅ 勾选
   - File size limit: 10MB
   - Allowed MIME types: `image/*`

#### 创建 `cat-videos` bucket
1. 同样方式创建第二个bucket
2. 设置：
   - Name: `cat-videos`
   - Public bucket: ✅ 勾选
   - File size limit: 50MB
   - Allowed MIME types: `video/*`

### 2. 配置RLS策略

#### 为 `cat-images` bucket 配置RLS策略

1. 进入Storage > Policies
2. 选择 `cat-images` bucket
3. 点击 "New Policy"
4. 配置以下策略：

**INSERT策略（允许上传）:**
```sql
-- 允许已认证用户上传图片
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'cat-images' AND
  auth.role() = 'authenticated'
);
```

**SELECT策略（允许读取）:**
```sql
-- 允许所有人读取图片
CREATE POLICY "Allow public read access to images" ON storage.objects
FOR SELECT USING (bucket_id = 'cat-images');
```

#### 为 `cat-videos` bucket 配置RLS策略

**INSERT策略（允许上传）:**
```sql
-- 允许已认证用户上传视频
CREATE POLICY "Allow authenticated users to upload videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'cat-videos' AND
  auth.role() = 'authenticated'
);
```

**SELECT策略（允许读取）:**
```sql
-- 允许所有人读取视频
CREATE POLICY "Allow public read access to videos" ON storage.objects
FOR SELECT USING (bucket_id = 'cat-videos');
```

### 3. 验证配置

创建以下SQL脚本来验证配置：

```sql
-- 检查bucket是否存在
SELECT name FROM storage.buckets WHERE name IN ('cat-images', 'cat-videos');

-- 检查RLS策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects';
```

### 4. 临时解决方案

如果RLS配置仍然有问题，当前代码已经实现了备用方案：

1. **图片备用方案**: 使用Unsplash公开图片
2. **视频备用方案**: 使用示例视频URL

这样可以确保应用在Supabase Storage配置完成之前也能正常工作。

### 5. 环境变量检查

确保在 `.env.local` 文件中正确配置了Supabase环境变量：

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 6. 测试步骤

1. 启动应用：`npm run dev`
2. 启动后端服务：`node server.js`
3. 尝试生成猫咪图片
4. 检查是否成功上传到Supabase Storage
5. 尝试生成视频
6. 验证视频是否成功上传

### 7. 故障排除

如果仍然遇到问题：

1. **检查用户认证状态**: 确保用户已登录
2. **检查bucket权限**: 确保bucket是public的
3. **检查RLS策略**: 确保策略正确配置
4. **查看控制台错误**: 检查详细的错误信息
5. **使用备用方案**: 当前代码会自动使用备用方案

### 8. 联系支持

如果问题持续存在，请：
1. 检查Supabase项目设置
2. 联系Supabase支持
3. 或者使用当前的备用方案继续开发 