import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 调试信息
console.log('🔍 环境变量检查:');
console.log('VITE_SUPABASE_URL:', supabaseUrl);
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '已设置' : '未设置');

// 开发环境下的环境变量检查
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please check your .env.local file.');
  // 在开发环境中，我们可以使用默认值或显示友好的错误信息
  if (import.meta.env.DEV) {
    console.warn('Development mode: Supabase connection will be disabled.');
  }
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// 数据库表名常量
export const TABLES = {
  USERS: 'users',
  CATS: 'cats',
  VIDEOS: 'videos'
} as const;

// Storage buckets
export const STORAGE_BUCKETS = {
  CAT_IMAGES: 'cat-images',
  CAT_VIDEOS: 'cat-videos'
} as const; 