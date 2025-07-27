import { supabase } from './client';
import type { User } from '../../types';

export const authService = {
  // 邮箱注册
  async signUpWithEmail(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });

    if (error) {
      // 提供更友好的错误信息
      if (error.message.includes('already registered')) {
        throw new Error('该邮箱已注册，请直接登录');
      }
      throw new Error(`注册失败: ${error.message}`);
    }
    
    if (!data.user) throw new Error('注册失败，未返回用户数据');

    // 开发阶段：自动确认邮箱
    if (import.meta.env.DEV && !data.session) {
      console.log('开发模式：自动确认邮箱');
      // 尝试直接登录
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) {
        throw new Error('注册成功，但自动登录失败，请手动登录');
      }
      
      if (signInData.user) {
        return {
          id: signInData.user.id,
          email: signInData.user.email!,
          createdAt: new Date()
        };
      }
    }

    // 检查是否需要邮箱确认
    if (!data.session) {
      throw new Error('注册成功！请检查邮箱并点击确认链接完成注册。');
    }

    return {
      id: data.user.id,
      email: data.user.email!,
      createdAt: new Date()
    };
  },

  // 邮箱登录
  async signInWithEmail(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      // 提供更友好的错误信息
      if (error.message.includes('Email not confirmed')) {
        throw new Error('邮箱未确认，请检查邮箱并点击确认链接');
      }
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('邮箱或密码错误');
      }
      throw new Error(`登录失败: ${error.message}`);
    }
    
    if (!data.user) throw new Error('登录失败，未返回用户数据');

    return {
      id: data.user.id,
      email: data.user.email!,
      createdAt: new Date()
    };
  },

  // 退出登录
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(`退出失败: ${error.message}`);
  },

  // 获取当前用户
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return null;

      return {
        id: user.id,
        email: user.email!,
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // 监听认证状态变化
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email!,
          createdAt: new Date()
        };
        callback(user);
      } else if (event === 'SIGNED_OUT') {
        callback(null);
      }
    });
  }
}; 