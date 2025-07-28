import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// 创建本地图片存储目录
const LOCAL_IMAGES_DIR = path.join(__dirname, 'local-images');
if (!fs.existsSync(LOCAL_IMAGES_DIR)) {
  fs.mkdirSync(LOCAL_IMAGES_DIR, { recursive: true });
}

// 静态文件服务
app.use('/local-images', express.static(LOCAL_IMAGES_DIR));

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Supabase客户端
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://ujyiiezeiklmqhkvyvaq.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqeWlpaWV6ZWlrbG1xaGt2eXZhcSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzUzNjMzMTc1LCJleHAiOjIwNjkxODkxNzV9.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'
);

/**
 * 下载并保存图片到本地
 */
async function downloadAndSaveImage(imageUrl, fileName) {
  try {
    console.log('开始下载图片到本地:', imageUrl);
    
    // 构建请求头
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    };
    
    // 如果是通义万相OSS URL，添加认证头
    if (imageUrl.includes('dashscope-result')) {
      const apiKey = process.env.DASHSCOPE_API_KEY || process.env.VITE_TONGYI_API_KEY || 'sk-4b1c8b1d172c4be09827cdf5f83442e5';
      headers['Authorization'] = `Bearer ${apiKey}`;
      console.log('添加认证头用于通义万相OSS访问');
    }
    
    const response = await fetch(imageUrl, {
      headers,
      timeout: 30000,
      follow: 5, // 允许重定向
      size: 0 // 不限制响应大小
    });
    
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }
    
    const buffer = await response.buffer();
    const filePath = path.join(LOCAL_IMAGES_DIR, fileName);
    
    fs.writeFileSync(filePath, buffer);
    console.log('图片已保存到本地:', filePath);
    
    // 返回本地HTTP URL
    const localUrl = `http://localhost:${PORT}/local-images/${fileName}`;
    console.log('本地图片URL:', localUrl);
    
    return localUrl;
  } catch (error) {
    console.error('下载图片失败:', error);
    throw error;
  }
}

// 图片获取代理API
app.post('/api/fetch-image', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    console.log('代理获取图片:', imageUrl);

    if (!imageUrl) {
      return res.status(400).json({ error: '缺少图片URL' });
    }

    // 清理URL
    const cleanUrl = validateAndCleanImageUrl(imageUrl);
    
    try {
      // 尝试获取原始图片
      const response = await fetch(cleanUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'image/*'
        },
        timeout: 15000
      });

      if (response.ok) {
        // 获取图片数据并设置正确的Content-Type
        const imageBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        
        res.setHeader('Content-Type', contentType);
        res.send(Buffer.from(imageBuffer));
        return;
      } else {
        console.log(`原始图片获取失败，状态码: ${response.status}`);
      }
    } catch (originalError) {
      console.log('原始图片获取失败:', originalError.message);
    }

    // 如果原始图片获取失败，使用备用图片
    console.log('使用备用图片');
    const fallbackResponse = await fetch('https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=512&h=512&fit=crop', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*'
      },
      timeout: 15000
    });

    if (!fallbackResponse.ok) {
      throw new Error(`无法获取备用图片: ${fallbackResponse.status}`);
    }

    const fallbackBuffer = await fallbackResponse.arrayBuffer();
    const contentType = fallbackResponse.headers.get('content-type') || 'image/jpeg';
    
    res.setHeader('Content-Type', contentType);
    res.send(Buffer.from(fallbackBuffer));
  } catch (error) {
    console.error('代理获取图片失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 视频获取代理API
app.post('/api/fetch-video', async (req, res) => {
  try {
    const { videoUrl } = req.body;
    console.log('代理获取视频:', videoUrl);

    if (!videoUrl) {
      return res.status(400).json({ error: '缺少视频URL' });
    }

    // 获取视频数据
    const response = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'video/*'
      },
      timeout: 30000
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
    }

    // 获取视频数据并设置正确的Content-Type
    const videoBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'video/mp4';
    
    res.setHeader('Content-Type', contentType);
    res.send(Buffer.from(videoBuffer));
  } catch (error) {
    console.error('代理获取视频失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 视频生成API
app.post('/api/generate-video', async (req, res) => {
  try {
    const { imageUrl, prompt, duration = 3 } = req.body;
    console.log('开始生成视频:', { imageUrl, prompt, duration });

    // 验证参数
    if (!imageUrl || !prompt) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数：imageUrl 和 prompt'
      });
    }

    // 获取API密钥
    const apiKey = process.env.DASHSCOPE_API_KEY || process.env.VITE_TONGYI_API_KEY || 'sk-4b1c8b1d172c4be09827cdf5f83442e5';
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'API密钥未配置'
      });
    }

    // 构建视频生成配置
    const videoConfig = {
      imageUrl: imageUrl,
      prompt: prompt,
      duration: Math.min(Math.max(duration, 1), 10) // 限制时长在1-10秒之间
    };

    console.log('视频生成配置:', videoConfig);

    // 调用通义万相视频生成API
    const result = await generateVideo(apiKey, videoConfig);
    
    console.log('视频生成完成:', result);
    res.json(result);
  } catch (error) {
    console.error('视频生成失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 创建视频生成任务
 */
async function createVideoTask(apiKey, requestBody) {
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`发送视频生成API请求到通义万相... (尝试 ${attempt}/${maxRetries})`);
      
      const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'X-DashScope-Async': 'enable',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive'
        },
        body: JSON.stringify(requestBody),
        timeout: 60000 // 增加到60秒超时
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`视频生成API调用失败 (尝试 ${attempt}/${maxRetries}):`, response.status, response.statusText, errorText);
        
        // 如果是最后一次尝试，抛出错误
        if (attempt === maxRetries) {
          throw new Error(`API调用失败: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        // 否则等待后重试
        console.log(`等待 ${attempt * 2} 秒后重试...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 2000));
        continue;
      }

      const result = await response.json();
      console.log('视频生成任务创建成功:', result);
      return result;
    } catch (error) {
      console.error(`创建视频生成任务失败 (尝试 ${attempt}/${maxRetries}):`, error);
      
      // 如果是最后一次尝试，抛出错误
      if (attempt === maxRetries) {
        throw error;
      }
      
      // 否则等待后重试
      console.log(`等待 ${attempt * 2} 秒后重试...`);
      await new Promise(resolve => setTimeout(resolve, attempt * 2000));
    }
  }
}

/**
 * 轮询任务状态
 */
async function pollTaskStatus(apiKey, taskId) {
  const maxAttempts = 180; // 增加到180次（10分钟）
  const interval = 3000; // 每3秒轮询一次
  
  console.log(`开始轮询任务状态，任务ID: ${taskId}`);
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    console.log(`轮询第 ${attempt + 1}/${maxAttempts} 次`);
    
    try {
      const status = await queryTaskStatus(apiKey, taskId);
      
      // 处理不同的状态字段名
      const taskStatus = status.output?.task_status || status.status || status.task_status || status.state;
      console.log(`任务状态: ${taskStatus}`);
      
      if (taskStatus === 'completed' || taskStatus === 'SUCCEEDED') {
        console.log('视频生成完成！');
        const videoUrl = status.output?.video_url || status.output?.url || status.video_url;
        return {
          taskId,
          status: 'completed',
          videoUrl: videoUrl
        };
      }
      
      if (taskStatus === 'failed' || taskStatus === 'FAILED') {
        console.log('视频生成失败:', status.output?.message || status.error || status.message || '视频生成失败');
        return {
          taskId,
          status: 'failed',
          error: status.output?.message || status.error || status.message || '视频生成失败'
        };
      }
      
      // 如果状态为undefined，可能是还在处理中
      if (taskStatus === undefined || taskStatus === 'PENDING' || taskStatus === 'RUNNING') {
        console.log('任务正在处理中...');
      }
      
      // 等待后继续轮询
      await new Promise(resolve => setTimeout(resolve, interval));
    } catch (error) {
      console.error(`轮询第 ${attempt + 1} 次失败:`, error);
      // 继续轮询，不要因为单次失败就停止
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
  
  throw new Error('视频生成超时（10分钟）');
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
    const errorText = await response.text();
    throw new Error(`查询任务状态失败: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const result = await response.json();
  console.log(`任务状态查询结果:`, {
    taskId,
    status: result.status,
    output: result.output ? '有输出' : '无输出',
    error: result.error,
    fullResponse: JSON.stringify(result, null, 2)
  });
  
  return result;
}

/**
 * 构建视频生成提示词
 */
function buildVideoPrompt(action) {
  return `一只可爱的猫咪正在${action}，全身照，完整展示猫咪的身体和脸部，动作自然流畅，画面温馨，高清画质，背景简洁，只有一只猫咪，动作连贯，表情生动，姿态自然`;
}

/**
 * 验证和清理图片URL
 */
function validateAndCleanImageUrl(url) {
  try {
    // 解码URL
    let cleanUrl = decodeURIComponent(url);
    
    // 移除查询参数（如果存在）
    if (cleanUrl.includes('?')) {
      cleanUrl = cleanUrl.split('?')[0];
    }
    
    // 移除哈希参数（如果存在）
    if (cleanUrl.includes('#')) {
      cleanUrl = cleanUrl.split('#')[0];
    }
    
    // 验证URL格式
    new URL(cleanUrl);
    
    console.log('清理后的URL:', cleanUrl);
    return cleanUrl;
  } catch (error) {
    console.error('URL清理失败:', error);
    throw new Error(`无效的图片URL: ${url}`);
  }
}

/**
 * 获取图片的Base64编码
 */
async function getImageAsBase64(imageUrl) {
  try {
    console.log('开始获取图片Base64编码:', imageUrl);
    const cleanUrl = validateAndCleanImageUrl(imageUrl);
    
    const fetchOptions = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*'
      },
      timeout: 20000
    };

    if (cleanUrl.includes('dashscope-result')) {
      const apiKey = process.env.DASHSCOPE_API_KEY || process.env.VITE_TONGYI_API_KEY || 'sk-4b1c8b1d172c4be09827cdf5f83442e5';
      if (!apiKey) {
        throw new Error('API密钥未配置，无法获取OSS图片');
      }
      fetchOptions.headers['Authorization'] = `Bearer ${apiKey}`;
      console.log('为通义万相OSS URL添加Authorization头');
    }

    try {
      const response = await fetch(cleanUrl, fetchOptions);
      
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        console.log('图片Base64编码获取成功，长度:', base64.length);
        console.log('Base64前20个字符:', base64.substring(0, 20));
        return base64;
      } else {
        console.log(`图片获取失败，状态码: ${response.status}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (fetchError) {
      console.error('原始图片获取失败:', fetchError);
      // Fallback to a test image if fetching the original URL fails
      console.log('使用备用测试图片');
      const testImageUrl = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=512&h=512&fit=crop';
      const testImageResponse = await fetch(testImageUrl);
      if (!testImageResponse.ok) {
        throw new Error(`Failed to fetch fallback image: ${testImageResponse.status} ${testImageResponse.statusText}`);
      }
      const testImageBuffer = await testImageResponse.arrayBuffer();
      const testImageBase64 = Buffer.from(testImageBuffer).toString('base64');
      console.log('测试图片Base64编码获取成功，长度:', testImageBase64.length);
      return testImageBase64;
    }
  } catch (error) {
    console.error('获取图片Base64失败:', error);
    throw new Error(`无法获取图片Base64编码: ${error.message}`);
  }
}

// 图片生成API
app.post('/api/generate-image', async (req, res) => {
  try {
    const { breed, age, gender } = req.body;
    console.log('开始生成猫咪图片:', { breed, age, gender });

    // 获取API密钥
    const apiKey = process.env.DASHSCOPE_API_KEY || process.env.VITE_TONGYI_API_KEY || 'sk-4b1c8b1d172c4be09827cdf5f83442e5';
    if (!apiKey) {
      return res.status(500).json({ error: 'API密钥未配置' });
    }

    // 构建提示词
    const prompt = buildImagePrompt(breed, age, gender);
    console.log('开始调用通义万相API，提示词:', prompt);

    // 生成图片
    const imageUrl = await generateImage(apiKey, prompt);
    console.log('猫咪图片生成成功:', imageUrl);
    
    // 直接返回通义万相的OSS URL，跳过Supabase上传
    res.json({ success: true, imageUrl: imageUrl });
  } catch (error) {
    console.error('图片生成失败:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * 构建图片生成提示词
 */
function buildImagePrompt(breed, age, gender) {
  const breedMap = {
    'british-shorthair': '英国短毛猫',
    'american-shorthair': '美国短毛猫',
    'persian': '波斯猫',
    'siamese': '暹罗猫',
    'maine-coon': '缅因猫',
    'ragdoll': '布偶猫'
  };

  const ageMap = {
    'kitten': '幼猫',
    'adult': '成年猫',
    'senior': '老年猫'
  };

  const genderMap = {
    'male': '公猫',
    'female': '母猫'
  };

  const breedLabel = breedMap[breed] || breed;
  const ageLabel = ageMap[age] || age;
  const genderLabel = genderMap[gender] || gender;

  return `一只${ageLabel}的${genderLabel}${breedLabel}，全身照，完整展示猫咪的身体和脸部，高清写实风格，干净背景，毛发细节丰富，自然光线，专业摄影风格，4K超高清，猫咪姿态自然，表情生动`;
}

/**
 * 调用通义万相API生成图片
 */
async function generateImage(apiKey, prompt) {
  try {
    console.log('开始调用通义万相API，提示词:', prompt);
    
    const requestBody = {
      model: 'wan2.2-t2i-plus',
      input: {
        prompt: prompt
      },
      parameters: {
        size: '1024*1024',
        n: 1
      }
    };
    
    console.log('API请求体:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('API响应状态:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API错误响应:', errorText);
      throw new Error(`API调用失败: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('API成功响应:', JSON.stringify(result, null, 2));
    
    // 异步API返回task_id，需要轮询获取结果
    if (result.output && result.output.task_id) {
      const taskId = result.output.task_id;
      console.log('任务已创建，开始轮询结果，任务ID:', taskId);
      
      // 轮询获取结果
      const imageUrl = await pollImageTaskStatus(apiKey, taskId);
      
      return imageUrl;
    } else {
      throw new Error('API返回结果中没有任务ID');
    }
  } catch (error) {
    console.error('通义万相API调用失败:', error);
    throw error;
  }
}

/**
 * 轮询图片生成任务状态
 */
async function pollImageTaskStatus(apiKey, taskId) {
  const maxAttempts = 90; // 最多轮询90次
  const interval = 2000; // 每2秒轮询一次
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`轮询第 ${attempt}/${maxAttempts} 次`);
    
    try {
      const status = await queryImageTaskStatus(apiKey, taskId);
      console.log('任务状态查询结果:', status);
      
      // 检查任务状态
      if (status.task_status === 'SUCCEEDED') {
        console.log('图片生成成功');
        if (status.results && status.results.length > 0) {
          return status.results[0].url;
        } else {
          throw new Error('任务成功但没有返回图片URL');
        }
      } else if (status.task_status === 'FAILED') {
        throw new Error(`图片生成失败: ${status.message || '未知错误'}`);
      } else if (status.task_status === 'CANCELED') {
        throw new Error('图片生成任务被取消');
      } else if (status.task_status === 'RUNNING' || status.task_status === 'PENDING') {
        console.log('任务正在运行中，继续等待...');
      } else {
        console.log('未知任务状态:', status.task_status);
      }
      
      // 继续轮询
      await new Promise(resolve => setTimeout(resolve, interval));
    } catch (error) {
      console.error('轮询任务状态失败:', error);
      throw error;
    }
  }
  
  throw new Error('图片生成超时');
}

/**
 * 查询图片生成任务状态
 */
async function queryImageTaskStatus(apiKey, taskId) {
  const response = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`查询任务状态失败: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  console.log('任务状态完整响应:', JSON.stringify(result, null, 2));
  
  // 确保返回正确的结构
  if (result.output) {
    return result.output;
  } else {
    throw new Error('API响应中没有output字段');
  }
}

/**
 * 上传图片到Supabase Storage
 */
async function uploadImageToSupabase(imageUrl, fileName) {
  try {
    console.log('开始上传图片到Supabase Storage:', imageUrl);
    
    let imageBuffer;
    
    // 检查是否是本地文件路径
    if (imageUrl.startsWith('http://localhost:') || imageUrl.startsWith('file://')) {
      // 读取本地文件
      const filePath = imageUrl.replace('http://localhost:3001/local-images/', '');
      const fullPath = path.join(LOCAL_IMAGES_DIR, filePath);
      console.log('读取本地文件:', fullPath);
      imageBuffer = fs.readFileSync(fullPath);
    } else {
      // 从URL获取图片数据
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      };
      
      // 如果是通义万相OSS URL，添加认证头
      if (imageUrl.includes('dashscope-result')) {
        const apiKey = process.env.DASHSCOPE_API_KEY || process.env.VITE_TONGYI_API_KEY || 'sk-4b1c8b1d172c4be09827cdf5f83442e5';
        headers['Authorization'] = `Bearer ${apiKey}`;
        console.log('添加认证头用于通义万相OSS访问');
      }
      
      const imageResponse = await fetch(imageUrl, { headers });
      
      if (!imageResponse.ok) {
        throw new Error(`获取图片失败: ${imageResponse.status} ${imageResponse.statusText}`);
      }
      
      imageBuffer = await imageResponse.arrayBuffer();
    }
    
    const filePath = `cats/${fileName}`;
    
    console.log('图片数据获取成功，开始上传到Supabase Storage');
    
    // 上传到Supabase Storage
    const { data, error } = await supabase.storage
      .from('cat-images')
      .upload(filePath, imageBuffer, {
        contentType: 'image/png',
        upsert: false
      });
    
    if (error) {
      console.error('Supabase Storage上传失败:', error);
      throw new Error(`Supabase Storage上传失败: ${error.message}`);
    }
    
    console.log('Supabase Storage上传成功，文件路径:', filePath);
    
    // 获取公开URL
    const { data: publicUrlData } = supabase.storage
      .from('cat-images')
      .getPublicUrl(filePath);
    
    if (!publicUrlData.publicUrl) {
      throw new Error('Supabase Storage获取公开URL失败');
    }
    
    console.log('获取到公开URL:', publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('图片上传到Supabase Storage失败:', error);
    throw new Error(`图片上传到Supabase Storage失败: ${error.message}`);
  }
}

/**
 * 生成视频
 */
async function generateVideo(apiKey, config) {
  try {
    console.log('开始视频生成流程:', config);
    
    // 验证图片URL
    const imageUrl = config.imageUrl;
    if (!imageUrl) {
      throw new Error('图片URL不能为空');
    }

    // 处理图片URL - 如果是通义万相OSS URL，需要先下载并上传到Supabase
    let finalImageUrl = imageUrl;
    
    if (imageUrl.includes('dashscope-result')) {
      console.log('检测到通义万相OSS URL，需要处理');
      try {
        // 下载图片到本地
        const fileName = `cat_${Date.now()}.png`;
        const localImageUrl = await downloadAndSaveImage(imageUrl, fileName);
        console.log('图片已下载到本地:', localImageUrl);
        
        // 上传到Supabase Storage获得公网URL
        const supabaseImageUrl = await uploadImageToSupabase(localImageUrl, fileName);
        console.log('图片已上传到Supabase:', supabaseImageUrl);
        
        finalImageUrl = supabaseImageUrl;
      } catch (error) {
        console.error('处理图片失败，尝试直接使用原URL:', error.message);
        // 如果处理失败，尝试直接使用原URL
        finalImageUrl = imageUrl;
      }
    }
    
    console.log('最终使用图片URL:', finalImageUrl);

    // 构建视频生成请求
    const requestBody = {
      model: 'wan2.2-i2v-plus',
      input: {
        img_url: finalImageUrl,
        prompt: buildVideoPrompt(config.prompt)
      },
      parameters: {
        fps: 8,
        resolution: '1024*1024'  // 与图片尺寸保持一致
      }
    };

    console.log('发送视频生成请求:', JSON.stringify(requestBody, null, 2));

    // 创建视频生成任务
    const taskResponse = await createVideoTask(apiKey, requestBody);
    const taskId = taskResponse.output.task_id;

    console.log('视频生成任务已创建，任务ID:', taskId);

    // 轮询任务状态
    const result = await pollTaskStatus(apiKey, taskId);

    return {
      success: true,
      taskId: taskId,
      status: result.status,
      videoUrl: result.videoUrl,
      error: result.error
    };

  } catch (error) {
    console.error('视频生成失败:', error);
    return {
      success: false,
      status: 'failed',
      error: error.message
    };
  }
}

// 清理本地图片的定时任务（每小时清理一次）
setInterval(() => {
  try {
    const files = fs.readdirSync(LOCAL_IMAGES_DIR);
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000); // 1小时前
    
    files.forEach(file => {
      const filePath = path.join(LOCAL_IMAGES_DIR, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime.getTime() < oneHourAgo) {
        fs.unlinkSync(filePath);
        console.log('清理过期图片:', file);
      }
    });
  } catch (error) {
    console.error('清理本地图片失败:', error);
  }
}, 60 * 60 * 1000); // 每小时执行一次

app.listen(PORT, () => {
  console.log(`代理服务器运行在 http://localhost:${PORT}`);
  console.log(`本地图片服务: http://localhost:${PORT}/local-images/`);
}); 