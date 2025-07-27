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
  private apiKey: string;
  private baseUrl: string;
  
  constructor() {
    // 在浏览器环境中，环境变量通过import.meta.env访问
    this.apiKey = import.meta.env.VITE_TONGYI_API_KEY || '';
    this.baseUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image2video/generation';
  }
  
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
  
  /**
   * 创建视频生成任务
   */
  private async createVideoTask(config: VideoGenerationConfig) {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable'
      },
      body: JSON.stringify({
        model: 'wanx2.1-i2v-plus',
        input: {
          image: config.imageUrl,
          prompt: this.buildVideoPrompt(config.prompt)
        },
        parameters: {
          duration: config.duration || 3, // 默认3秒
          fps: 8, // 帧率
          resolution: '1024*576' // 分辨率
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API调用失败: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    return await response.json();
  }
  
  /**
   * 轮询任务状态
   */
  private async pollTaskStatus(taskId: string): Promise<VideoGenerationResponse> {
    const maxAttempts = 60; // 最多轮询60次
    const interval = 2000; // 每2秒轮询一次
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.queryTaskStatus(taskId);
      
      if (status.status === 'completed') {
        return {
          taskId,
          status: 'completed',
          videoUrl: status.output.video_url
        };
      }
      
      if (status.status === 'failed') {
        return {
          taskId,
          status: 'failed',
          error: status.error || '视频生成失败'
        };
      }
      
      // 等待后继续轮询
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error('视频生成超时');
  }
  
  /**
   * 查询任务状态
   */
  private async queryTaskStatus(taskId: string) {
    const response = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`查询任务状态失败: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  /**
   * 构建视频生成提示词
   */
  private buildVideoPrompt(action: string): string {
    return `一只可爱的猫咪正在${action}，动作自然流畅，画面温馨，高清画质，背景简洁，只有一只猫咪，动作连贯，表情生动`;
  }
}

export const tongyiVideoService = new TongyiVideoGenerationService(); 