interface VideoGenerationConfig {
  imageUrl: string;
  prompt: string;
  duration?: number; // 视频时长，单位秒
}

interface VideoGenerationResponse {
  taskId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  videoUrl?: string;
  error?: string;
}

class TongyiVideoGenerationService {
  /**
   * 生成视频
   * @param config 视频生成配置
   * @returns Promise<VideoGenerationResponse>
   */
  async generateVideo(config: VideoGenerationConfig): Promise<VideoGenerationResponse> {
    try {
      console.log('开始生成视频:', config);
      
      // 使用本地代理服务器调用
      const response = await fetch('http://localhost:3001/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`视频生成API调用失败: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('视频生成完成:', result);
      return result;
    } catch (error) {
      console.error('视频生成失败:', error);
      throw new Error(`视频生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
}

export const tongyiVideoService = new TongyiVideoGenerationService(); 