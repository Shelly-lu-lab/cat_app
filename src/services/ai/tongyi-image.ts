import type { CatConfig } from '../../types';

interface TongyiImageResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export class TongyiImageService {
  // 通过本地代理服务器调用真实API
  async generateCatImage(config: CatConfig): Promise<string> {
    console.log('生成猫咪图片:', config);
    try {
      const response = await fetch(
        'http://localhost:3001/api/generate-image',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            breed: config.breed,
            age: config.age,
            gender: config.gender
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API调用失败: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result: TongyiImageResponse = await response.json();
      if (!result.success) {
        throw new Error(result.error || '图片生成失败');
      }
      console.log('猫咪图片生成成功:', result.imageUrl);
      return result.imageUrl!;
    } catch (error) {
      console.error('生成猫咪图片失败:', error);
      throw error;
    }
  }

  private buildPrompt(config: CatConfig): string {
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

    return `一只${age}的${gender}${breed}，高清写实风格，干净背景，毛发细节丰富，自然光线，专业摄影风格，4K超高清`;
  }
}

// 创建服务实例
export const tongyiImageService = new TongyiImageService(); 