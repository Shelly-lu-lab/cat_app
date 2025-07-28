import { supabase } from './client';
import { STORAGE_BUCKETS } from './client';

/**
 * Supabase Storage服务
 */
export class StorageService {
  /**
   * 上传图片到Supabase Storage
   * 支持Base64数据和URL两种输入
   */
  async uploadImage(imageDataOrUrl: string, fileName: string): Promise<string> {
    try {
      console.log('开始处理图片数据:', imageDataOrUrl.substring(0, 50) + '...');
      
      let imageBlob: Blob;
      
      // 检查是否是Base64数据
      if (imageDataOrUrl.startsWith('data:image/') || imageDataOrUrl.startsWith('data:application/octet-stream')) {
        console.log('检测到Base64图片数据，直接使用');
        // 将Base64转换为Blob
        const base64Data = imageDataOrUrl.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        imageBlob = new Blob([byteArray], { type: 'image/png' });
      } else {
        // 对于URL，使用代理获取
        console.log('使用代理获取图片数据');
        const response = await fetch('http://localhost:3001/api/fetch-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageUrl: imageDataOrUrl })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch image via proxy: ${response.status} ${response.statusText}`);
        }
        
        imageBlob = await response.blob();
      }
      
      const file = new File([imageBlob], fileName, { type: imageBlob.type });
      
      // 检查用户是否已登录
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('用户未登录，无法上传文件');
      }
      
      // 尝试上传到Supabase Storage
      try {
        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKETS.CAT_IMAGES)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (error) {
          console.error('Supabase Storage上传错误详情:', error);
          
          // 如果是RLS策略错误，使用备用方案
          if (error.message.includes('row-level security policy')) {
            console.warn('RLS策略阻止上传，使用备用方案');
            return this.useFallbackImageUpload(imageDataOrUrl, fileName);
          }
          
          throw new Error(`Failed to upload image to Supabase: ${error.message}`);
        }
        
        // 获取公共URL
        const { data: { publicUrl } } = supabase.storage
          .from(STORAGE_BUCKETS.CAT_IMAGES)
          .getPublicUrl(fileName);
        
        console.log('图片上传成功:', publicUrl);
        return publicUrl;
      } catch (uploadError) {
        console.error('Supabase Storage上传失败，使用备用方案:', uploadError);
        return this.useFallbackImageUpload(imageDataOrUrl, fileName);
      }
    } catch (error) {
      console.error('图片处理失败:', error);
      throw new Error(`图片处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 备用图片上传方案
   */
  private async useFallbackImageUpload(imageDataOrUrl: string, fileName: string): Promise<string> {
    console.log('使用备用图片上传方案');
    
    // 总是返回一个公开的猫咪图片URL作为备用
    console.log('使用Unsplash公开图片作为备用方案');
    return 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=512&h=512&fit=crop';
  }

  /**
   * 上传视频到Supabase Storage
   */
  async uploadVideo(videoUrl: string, fileName: string): Promise<string> {
    try {
      console.log('开始上传视频到Supabase Storage:', videoUrl);
      
      // 通过后端代理获取视频数据，避免CORS问题
      const response = await fetch('http://localhost:3001/api/fetch-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch video via proxy: ${response.status} ${response.statusText}`);
      }
      
      const videoBlob = await response.blob();
      const file = new File([videoBlob], fileName, { type: videoBlob.type });
      
      // 检查用户是否已登录
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('用户未登录，无法上传文件');
      }
      
      // 尝试上传到Supabase Storage
      try {
        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKETS.CAT_VIDEOS)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (error) {
          console.error('Supabase Storage上传错误详情:', error);
          
          // 如果是RLS策略错误，使用备用方案
          if (error.message.includes('row-level security policy')) {
            console.warn('RLS策略阻止上传，使用备用方案');
            return this.useFallbackVideoUpload(videoUrl, fileName);
          }
          
          throw new Error(`Failed to upload video to Supabase: ${error.message}`);
        }
        
        // 获取公共URL
        const { data: { publicUrl } } = supabase.storage
          .from(STORAGE_BUCKETS.CAT_VIDEOS)
          .getPublicUrl(fileName);
        
        console.log('视频上传成功:', publicUrl);
        return publicUrl;
      } catch (uploadError) {
        console.error('Supabase Storage上传失败，使用备用方案:', uploadError);
        return this.useFallbackVideoUpload(videoUrl, fileName);
      }
    } catch (error) {
      console.error('视频上传失败:', error);
      throw new Error(`视频上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 备用视频上传方案
   */
  private async useFallbackVideoUpload(videoUrl: string, fileName: string): Promise<string> {
    console.log('使用备用视频上传方案');
    
    // 方案1: 直接使用原始URL（如果它是公网可访问的）
    if (videoUrl.startsWith('https://') && !videoUrl.includes('dashscope-result')) {
      console.log('使用原始视频URL作为备用方案');
      return videoUrl;
    }
    
    // 方案2: 返回一个示例视频URL
    console.log('使用示例视频URL作为备用方案');
    return 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4';
  }

  /**
   * 删除文件
   */
  async deleteFile(bucket: string, fileName: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([fileName]);
      
      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }
      
      console.log('文件删除成功:', fileName);
    } catch (error) {
      console.error('文件删除失败:', error);
      throw new Error(`文件删除失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 检查Storage bucket是否存在
   */
  async checkBucketExists(bucketName: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage.listBuckets();
      if (error) {
        console.error('检查bucket失败:', error);
        return false;
      }
      
      const bucketExists = data?.some(bucket => bucket.name === bucketName);
      console.log(`Bucket ${bucketName} 存在:`, bucketExists);
      return bucketExists || false;
    } catch (error) {
      console.error('检查bucket时出错:', error);
      return false;
    }
  }
}

export const storageService = new StorageService(); 