import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { tongyiImageService } from '../../services/ai/tongyi-image';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';
import { CAT_BREEDS, CAT_AGES, CAT_GENDERS } from '../../types';
import type { CatConfig } from '../../types';

export const CatGenerator: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentCat, setLoading, setError, clearError } = useAppStore();
  
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
      const imageUrl = await tongyiImageService.generateCatImage(config);
      
      console.log('猫咪图片生成成功:', imageUrl);
      
      // 保存到全局状态
      setCurrentCat({
        id: Date.now().toString(),
        name: '',
        imageUrl,
        config,
        createdAt: new Date(),
        userId: undefined
      });
      
      // 跳转到命名页面
      navigate('/cat-name');
    } catch (error) {
      console.error('生成猫咪图片失败:', error);
      setError(error instanceof Error ? error.message : '生成失败，请稍后重试');
    } finally {
      setIsGenerating(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            🐱 生成你的专属猫咪
          </h1>
          
          <p className="text-gray-600 text-center mb-6">
            选择猫咪的特征，AI将为你生成专属的猫咪图片
          </p>

          <div className="space-y-6">
            {/* 品种选择 */}
            <div>
              <label>品种</label>
              <select
                value={config.breed}
                onChange={(e) => handleConfigChange('breed', e.target.value)}
              >
                {CAT_BREEDS.map(breed => (
                  <option key={breed.value} value={breed.value}>
                    {breed.emoji} {breed.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 年龄选择 */}
            <div>
              <label>年龄</label>
              <select
                value={config.age}
                onChange={(e) => handleConfigChange('age', e.target.value)}
              >
                {CAT_AGES.map(age => (
                  <option key={age.value} value={age.value}>
                    {age.emoji} {age.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 性别选择 */}
            <div>
              <label>性别</label>
              <select
                value={config.gender}
                onChange={(e) => handleConfigChange('gender', e.target.value)}
              >
                {CAT_GENDERS.map(gender => (
                  <option key={gender.value} value={gender.value}>
                    {gender.emoji} {gender.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 生成按钮 */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-orange-500 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" text="AI正在生成猫咪..." />
                </div>
              ) : (
                '🐱 生成猫咪'
              )}
            </button>
          </div>

          {/* 返回按钮 */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              ← 返回仪表板
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 