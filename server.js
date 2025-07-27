import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 视频生成API代理
app.post('/api/generate-video', async (req, res) => {
  try {
    const { imageUrl, prompt, duration = 3 } = req.body;
    
    if (!imageUrl || !prompt) {
      return res.status(400).json({ error: '缺少必要参数: imageUrl 和 prompt' });
    }

    // 获取API密钥
    const apiKey = process.env.DASHSCOPE_API_KEY || 'sk-4b1c8b1d172c4be09827cdf5f83442e5';
    if (!apiKey) {
      return res.status(500).json({ error: 'API密钥未配置' });
    }

    console.log('开始生成视频:', { imageUrl, prompt, duration });

    // 第一步：创建视频生成任务
    const taskResponse = await createVideoTask(apiKey, { imageUrl, prompt, duration });
    const taskId = taskResponse.output.task_id;
    
    console.log('视频生成任务已创建，任务ID:', taskId);
    
    // 第二步：轮询任务状态直到完成
    const result = await pollTaskStatus(apiKey, taskId);
    
    console.log('视频生成完成:', result);
    res.json(result);
  } catch (error) {
    console.error('视频生成失败:', error);
    res.status(500).json({ 
      error: `视频生成失败: ${error.message}` 
    });
  }
});

/**
 * 创建视频生成任务
 */
async function createVideoTask(apiKey, config) {
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
async function pollTaskStatus(apiKey, taskId) {
  const maxAttempts = 60; // 最多轮询60次
  const interval = 2000; // 每2秒轮询一次
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const status = await queryTaskStatus(apiKey, taskId);
    
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
async function queryTaskStatus(apiKey, taskId) {
  const response = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
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
function buildVideoPrompt(action) {
  return `一只可爱的猫咪正在${action}，动作自然流畅，画面温馨，高清画质，背景简洁，只有一只猫咪，动作连贯，表情生动`;
}

app.listen(PORT, () => {
  console.log(`代理服务器运行在 http://localhost:${PORT}`);
}); 