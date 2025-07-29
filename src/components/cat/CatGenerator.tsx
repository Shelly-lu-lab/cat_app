import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { tongyiImageService } from '../../services/ai/tongyi-image';
import { storageService } from '../../services/supabase/storage';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';
import { Header } from '../ui/Header';
import { CAT_BREEDS, CAT_AGES, CAT_GENDERS } from '../../types';
import type { CatConfig } from '../../types';

// 简笔画猫咪头SVG组件
const CatLogo: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
  <svg 
    className={className} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* 猫咪头部轮廓 - 使用与背景融合的颜色 */}
    <ellipse cx="50" cy="55" rx="35" ry="30" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2"/>
    
    {/* 猫咪耳朵 */}
    <path d="M25 35 L35 15 L45 35 Z" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5"/>
    <path d="M55 35 L65 15 L75 35 Z" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5"/>
    
    {/* 猫咪眼睛 */}
    <circle cx="40" cy="50" r="4" fill="#1F2937"/>
    <circle cx="60" cy="50" r="4" fill="#1F2937"/>
    <circle cx="42" cy="48" r="1.5" fill="#FFFFFF"/>
    <circle cx="62" cy="48" r="1.5" fill="#FFFFFF"/>
    
    {/* 猫咪鼻子 */}
    <path d="M50 58 L48 62 L52 62 Z" fill="#F59E0B"/>
    
    {/* 猫咪嘴巴 */}
    <path d="M45 65 Q50 68 55 65" stroke="#1F2937" strokeWidth="1.5" fill="none"/>
    
    {/* 猫咪胡须 */}
    <line x1="20" y1="55" x2="35" y2="53" stroke="#1F2937" strokeWidth="1"/>
    <line x1="20" y1="58" x2="35" y2="58" stroke="#1F2937" strokeWidth="1"/>
    <line x1="20" y1="61" x2="35" y2="63" stroke="#1F2937" strokeWidth="1"/>
    
    <line x1="80" y1="55" x2="65" y2="53" stroke="#1F2937" strokeWidth="1"/>
    <line x1="80" y1="58" x2="65" y2="58" stroke="#1F2937" strokeWidth="1"/>
    <line x1="80" y1="61" x2="65" y2="63" stroke="#1F2937" strokeWidth="1"/>
  </svg>
);

export const CatGenerator: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentCat, setLoading, setError, clearError, error } = useAppStore();
  
  const [config, setConfig] = useState<CatConfig>({
    breed: 'persian',
    age: 'adult',
    gender: 'female'
  });
  
  const [isGenerating, setIsGenerating] = useState(false);

  const handleConfigChange = (key: keyof CatConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setLoading(true);
    clearError();

    try {
      console.log('开始生成猫咪图片:', config);
      
      // 调用真实API生成猫咪图片
      const originalImageUrl = await tongyiImageService.generateCatImage(config);
      
      console.log('猫咪图片生成成功:', originalImageUrl);
      
      // 立即上传到Supabase Storage，确保图片URL持久化
      const fileName = `cat_${Date.now()}.png`;
      const persistentImageUrl = await storageService.uploadImage(originalImageUrl, fileName);
      
      console.log('图片已上传到Supabase Storage:', persistentImageUrl);
      
      // 保存到全局状态（使用持久化的URL）
      setCurrentCat({
        id: Date.now().toString(),
        name: '',
        imageUrl: persistentImageUrl, // 使用持久化的URL
        config,
        createdAt: new Date(),
        userId: undefined
      });
      
      // 跳转到命名页面
      navigate('/name-cat');
    } catch (error) {
      console.error('生成猫咪图片失败:', error);
      setError(error instanceof Error ? error.message : '生成失败，请稍后重试');
    } finally {
      setIsGenerating(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 页面标题区域 */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <div className="relative">
              <CatLogo className="w-16 h-16" />
              <div className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-sparkle">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            领养你的专属AI猫咪
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            选择你喜欢的猫咪特征，AI将为你生成一只独一无二的虚拟猫咪，从此开始你们的美好时光
          </p>
        </div>

        {/* 错误提示 */}
        {error && <ErrorMessage error={error} onClose={clearError} />}

        {/* 选择卡片网格 */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* 品种选择 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-5 h-5 text-orange-500">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">选择品种</h2>
            </div>
            
            <div className="space-y-3">
              {CAT_BREEDS.map(breed => (
                <button
                  key={breed.value}
                  onClick={() => handleConfigChange('breed', breed.value)}
                  className={`option-card w-full text-left ${
                    config.breed === breed.value ? 'selected' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{breed.emoji}</span>
                    <div>
                      <div className="font-semibold text-gray-800">{breed.label}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {getBreedDescription(breed.value)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 年龄选择 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-5 h-5 text-purple-500">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">选择年龄</h2>
            </div>
            
            <div className="space-y-3">
              {CAT_AGES.map(age => (
                <button
                  key={age.value}
                  onClick={() => handleConfigChange('age', age.value)}
                  className={`option-card w-full text-left ${
                    config.age === age.value ? 'selected' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{age.emoji}</span>
                    <div>
                      <div className="font-semibold text-gray-800">{age.label}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {getAgeDescription(age.value)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 性别选择 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-5 h-5 text-pink-500">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">选择性别</h2>
            </div>
            
            <div className="space-y-3">
              {CAT_GENDERS.map(gender => (
                <button
                  key={gender.value}
                  onClick={() => handleConfigChange('gender', gender.value)}
                  className={`option-card w-full text-left ${
                    config.gender === gender.value ? 'selected' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{gender.emoji}</span>
                    <div>
                      <div className="font-semibold text-gray-800">{gender.label}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {getGenderDescription(gender.value)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 生成按钮 */}
        <div className="text-center">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="generate-button"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center space-x-2">
                <LoadingSpinner size="sm" text="AI正在生成猫咪..." />
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <span>生成我的猫咪</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            )}
          </button>
          
          <p className="text-sm text-gray-500 mt-4">
            请选择猫咪的品种、年龄和性别后开始生成
          </p>
        </div>


      </main>
    </div>
  );
};

// 辅助函数
function getBreedDescription(breed: string): string {
  const descriptions: Record<string, string> = {
    'british-shorthair': '温和友善，适合家庭',
    'american-shorthair': '活泼好动，适应性强',
    'persian': '优雅高贵，长毛美丽',
    'siamese': '聪明活泼，爱交流',
    'maine-coon': '体型较大，性格温顺',
    'ragdoll': '蓝眼睛，极其亲人'
  };
  return descriptions[breed] || '可爱的猫咪品种';
}

function getAgeDescription(age: string): string {
  const descriptions: Record<string, string> = {
    'kitten': '活泼好动，需要更多关爱',
    'adult': '性格稳定，容易相处',
    'senior': '温和安静，需要细心照料'
  };
  return descriptions[age] || '不同年龄段的猫咪';
}

function getGenderDescription(gender: string): string {
  const descriptions: Record<string, string> = {
    'male': '通常较大较活泼',
    'female': '通常较小较温柔'
  };
  return descriptions[gender] || '不同性别的猫咪';
} 