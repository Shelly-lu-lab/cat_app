import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

interface CatConfig {
  breed: string;
  age: string;
  gender: string;
  style?: string;
}

function buildPrompt(config: CatConfig): string {
  // 根据配置构建优化的prompt
  const breedMap: Record<string, string> = {
    'british-shorthair': '英国短毛猫',
    'american-shorthair': '美国短毛猫',
    'persian': '波斯猫',
    'siamese': '暹罗猫',
    'maine-coon': '缅因猫',
    'ragdoll': '布偶猫'
  };

  const ageMap: Record<string, string> = {
    'kitten': '幼猫',
    'adult': '成年猫',
    'senior': '老年猫'
  };

  const genderMap: Record<string, string> = {
    'male': '公猫',
    'female': '母猫'
  };

  const breed = breedMap[config.breed] || config.breed;
  const age = ageMap[config.age] || config.age;
  const gender = genderMap[config.gender] || config.gender;

  return `一只${age}的${gender}${breed}，只有一只猫咪，高清写实风格，干净背景，毛发细节丰富，自然光线，专业摄影风格，4K超高清，单只猫咪特写`;
}

serve(async (req) => {
  // 处理CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const { breed, age, gender } = await req.json();
    
    if (!breed || !age || !gender) {
      throw new Error('缺少猫咪配置参数');
    }

    const config: CatConfig = { breed, age, gender };
    // 修正环境变量名为DASHSCOPE_API_KEY
    const apiKey = Deno.env.get('DASHSCOPE_API_KEY') || 'sk-4b1c8b1d172c4be09827cdf5f83442e5';
    
    if (!apiKey) {
      throw new Error('通义万相API密钥未配置');
    }

    const prompt = buildPrompt(config);
    console.log('生成猫咪图片，Prompt:', prompt);

    // 完善V2版模型的请求体格式
    const requestBody = {
      model: "wanx2.1-t2i-plus",
      input: {
        prompt: prompt
      },
      parameters: {
        size: "1024*1024",
        n: 1,
        seed: Math.floor(Math.random() * 1000000), // 随机种子
        prompt_extend: true,
        watermark: false
      }
    };

    console.log('API请求体:', JSON.stringify(requestBody, null, 2));

    // 使用通义万相V2版异步API端点
    const apiUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis';
    console.log('API端点:', apiUrl);

    const response = await fetch(apiUrl, {
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

    const data = await response.json();
    console.log('API响应数据:', data);
    
    // 获取任务ID
    const taskId = data.output?.task_id;
    if (!taskId) {
      console.error('API返回数据格式错误:', data);
      throw new Error('API返回数据格式错误，未获取到任务ID');
    }

    console.log('获取到任务ID:', taskId);

    // 轮询查询任务结果
    let retryCount = 0;
    const maxRetries = 30; // 最多等待30次，每次2秒，总共60秒
    
    while (retryCount < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒
      
      // 使用正确的通义万相V2版查询任务结果端点
      const resultResponse = await fetch(
        `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!resultResponse.ok) {
        const errorText = await resultResponse.text();
        console.error('查询任务结果失败:', errorText);
        throw new Error(`查询任务结果失败: ${resultResponse.status} ${resultResponse.statusText} - ${errorText}`);
      }

      const resultData = await resultResponse.json();
      console.log('任务查询结果:', resultData);

      if (resultData.output?.task_status === 'SUCCEEDED') {
        const imageUrl = resultData.output?.results?.[0]?.url;
        if (imageUrl) {
          console.log('图片生成成功:', imageUrl);
          return new Response(JSON.stringify({
            success: true,
            imageUrl: imageUrl
          }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
      } else if (resultData.output?.task_status === 'FAILED') {
        throw new Error('图片生成任务失败');
      }

      retryCount++;
      console.log(`任务进行中，第${retryCount}次查询...`);
    }

    throw new Error('图片生成超时，请稍后重试');

  } catch (error) {
    console.error('生成猫咪图片失败:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}); 