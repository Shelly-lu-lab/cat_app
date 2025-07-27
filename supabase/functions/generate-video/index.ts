import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

interface VideoGenerationRequest {
  imageUrl: string;
  prompt: string;
  duration?: number;
}

interface VideoGenerationResponse {
  taskId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  videoUrl?: string;
  error?: string;
}

serve(async (req) => {
  // 处理CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    const { imageUrl, prompt, duration = 3 } = await req.json() as VideoGenerationRequest;
    
    if (!imageUrl || !prompt) {
      return new Response(
        JSON.stringify({ error: '缺少必要参数: imageUrl 和 prompt' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    // 获取API密钥
    const apiKey = Deno.env.get('DASHSCOPE_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API密钥未配置' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    // 第一步：创建视频生成任务
    const taskResponse = await createVideoTask(apiKey, { imageUrl, prompt, duration });
    const taskId = taskResponse.output.task_id;
    
    console.log('视频生成任务已创建，任务ID:', taskId);
    
    // 第二步：轮询任务状态直到完成
    const result = await pollTaskStatus(apiKey, taskId);
    
    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error) {
    console.error('视频生成失败:', error);
    return new Response(
      JSON.stringify({ 
        error: `视频生成失败: ${error instanceof Error ? error.message : '未知错误'}` 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})

/**
 * 创建视频生成任务
 */
async function createVideoTask(apiKey: string, config: VideoGenerationRequest) {
  const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/image2video/generation', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable'
    },
    body: JSON.stringify({
      model: 'wanx2.1-i2v-plus',
      input: {
        image: config.imageUrl,
        prompt: buildVideoPrompt(config.prompt)
      },
      parameters: {
        duration: config.duration || 3,
        fps: 8,
        resolution: '1024*576'
      }
    })
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API调用失败: ${response.status} ${response.statusText} - ${errorText}`)
  }
  
  return await response.json()
}

/**
 * 轮询任务状态
 */
async function pollTaskStatus(apiKey: string, taskId: string): Promise<VideoGenerationResponse> {
  const maxAttempts = 60 // 最多轮询60次
  const interval = 2000 // 每2秒轮询一次
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const status = await queryTaskStatus(apiKey, taskId)
    
    if (status.status === 'completed') {
      return {
        taskId,
        status: 'completed',
        videoUrl: status.output.video_url
      }
    }
    
    if (status.status === 'failed') {
      return {
        taskId,
        status: 'failed',
        error: status.error || '视频生成失败'
      }
    }
    
    // 等待后继续轮询
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  
  throw new Error('视频生成超时')
}

/**
 * 查询任务状态
 */
async function queryTaskStatus(apiKey: string, taskId: string) {
  const response = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error(`查询任务状态失败: ${response.status} ${response.statusText}`)
  }
  
  return await response.json()
}

/**
 * 构建视频生成提示词
 */
function buildVideoPrompt(action: string): string {
  return `一只可爱的猫咪正在${action}，动作自然流畅，画面温馨，高清画质，背景简洁，只有一只猫咪，动作连贯，表情生动`
} 