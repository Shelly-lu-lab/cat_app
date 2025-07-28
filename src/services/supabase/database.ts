import { supabase, TABLES } from './client';
import type { User, CatInfo, VideoInfo } from '../../types';

// 用户相关操作
export const userService = {
  // 创建用户记录
  async createUser(user: User): Promise<void> {
    const { error } = await supabase
      .from(TABLES.USERS)
      .insert({
        id: user.id,
        email: user.email
      });
    
    if (error) throw new Error(`Failed to create user: ${error.message}`);
  },

  // 获取用户信息
  async getUser(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw new Error(`Failed to get user: ${error.message}`);
    return data;
  }
};

// 猫咪相关操作
export const catService = {
  // 保存猫咪信息
  async saveCat(cat: CatInfo): Promise<void> {
    const { error } = await supabase
      .from(TABLES.CATS)
      .insert({
        user_id: cat.userId,
        name: cat.name,
        breed: cat.config.breed,
        age: cat.config.age,
        gender: cat.config.gender,
        image_url: cat.imageUrl,
        config: cat.config
      });
    
    if (error) throw new Error(`Failed to save cat: ${error.message}`);
  },

  // 获取用户的所有猫咪
  async getUserCats(userId: string): Promise<CatInfo[]> {
    console.log('开始获取用户猫咪，用户ID:', userId);
    
    const { data, error } = await supabase
      .from(TABLES.CATS)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('获取猫咪数据失败:', error);
      throw new Error(`Failed to fetch cats: ${error.message}`);
    }
    
    console.log('从数据库获取的原始数据:', data);
    
    const mappedCats = (data || []).map(cat => {
      console.log('处理猫咪数据:', cat);
      
      // 检查必要字段是否存在
      if (!cat.id || !cat.name || !cat.image_url) {
        console.warn('猫咪数据不完整:', cat);
        return null;
      }
      
      return {
        id: cat.id,
        name: cat.name,
        imageUrl: cat.image_url,
        config: cat.config || {},
        createdAt: new Date(cat.created_at),
        userId: cat.user_id
      };
    }).filter(cat => cat !== null); // 过滤掉空数据
    
    console.log('映射后的猫咪数据:', mappedCats);
    return mappedCats;
  },

  // 获取单个猫咪
  async getCat(catId: string): Promise<CatInfo | null> {
    const { data, error } = await supabase
      .from(TABLES.CATS)
      .select('*')
      .eq('id', catId)
      .single();
    
    if (error) throw new Error(`Failed to get cat: ${error.message}`);
    
    if (!data) return null;
    
    return {
      id: data.id,
      name: data.name,
      imageUrl: data.image_url,
      config: data.config,
      createdAt: new Date(data.created_at),
      userId: data.user_id
    };
  },

  // 根据ID获取猫咪详情（返回原始数据）
  async getCatById(catId: string): Promise<any> {
    const { data, error } = await supabase
      .from(TABLES.CATS)
      .select('*')
      .eq('id', catId)
      .single();
    
    if (error) throw new Error(`Failed to get cat: ${error.message}`);
    return data;
  },

  // 删除猫咪
  async deleteCat(catId: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.CATS)
      .delete()
      .eq('id', catId);
    
    if (error) throw new Error(`Failed to delete cat: ${error.message}`);
  }
};

// 视频相关操作
export const videoService = {
  // 保存视频信息
  async saveVideo(video: VideoInfo): Promise<void> {
    const { error } = await supabase
      .from(TABLES.VIDEOS)
      .insert({
        cat_id: video.catId,
        user_id: video.userId,
        prompt: video.instruction,
        video_url: video.videoUrl,
        status: 'completed'
      });
    
    if (error) throw new Error(`Failed to save video: ${error.message}`);
  },

  // 获取猫咪的所有视频
  async getCatVideos(catId: string): Promise<VideoInfo[]> {
    const { data, error } = await supabase
      .from(TABLES.VIDEOS)
      .select('*')
      .eq('cat_id', catId)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to fetch videos: ${error.message}`);
    
    return (data || []).map(video => ({
      id: video.id,
      catId: video.cat_id,
      userId: video.user_id,
      instruction: video.prompt,
      videoUrl: video.video_url,
      createdAt: new Date(video.created_at)
    }));
  },

  // 更新视频状态
  async updateVideoStatus(videoId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.VIDEOS)
      .update({ status })
      .eq('id', videoId);
    
    if (error) throw new Error(`Failed to update video status: ${error.message}`);
  }
}; 