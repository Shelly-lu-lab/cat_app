import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { catService } from '../../services/supabase/database';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';
import { Header } from '../ui/Header';

// 建议名字列表
const SUGGESTED_NAMES = ['小橘', '雪球', '布丁', '咪咪', '豆豆', '花花', '咕噜', '小灰', '橙子', '奶茶'];

// 性格标签生成函数
function generatePersonalityTraits(breed: string, age: string, gender: string): string[] {
  const traits: Record<string, string[]> = {
    'british-shorthair': ['温柔', '安静', '优雅'],
    'american-shorthair': ['活泼', '友善', '适应性强'],
    'persian': ['高贵', '优雅', '安静'],
    'siamese': ['聪明', '活泼', '爱交流'],
    'maine-coon': ['温顺', '大只', '友善'],
    'ragdoll': ['亲人', '温柔', '蓝眼睛']
  };
  
  const ageTraits: Record<string, string[]> = {
    'kitten': ['活泼', '好奇', '爱玩'],
    'adult': ['稳定', '成熟', '独立'],
    'senior': ['安静', '温和', '需要关爱']
  };
  
  const genderTraits: Record<string, string[]> = {
    'male': ['勇敢', '保护欲强'],
    'female': ['温柔', '细心']
  };
  
  const breedTraits = traits[breed] || ['可爱', '友善'];
  const ageTraitsList = ageTraits[age] || ['可爱'];
  const genderTraitsList = genderTraits[gender] || ['可爱'];
  
  // 随机选择3个特征
  const allTraits = [...breedTraits, ...ageTraitsList, ...genderTraitsList];
  const shuffled = allTraits.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}

export const CatNamePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, currentCat, setCurrentCat, isLoading, error, setLoading, setError } = useAppStore();
  const [catName, setCatName] = useState('');

  const handleSaveCat = async () => {
    if (!user || !currentCat) {
      setError('数据错误');
      return;
    }

    if (!catName.trim()) {
      setError('请输入猫咪名字');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 更新猫咪信息
      const updatedCat = {
        ...currentCat,
        name: catName.trim(),
        userId: user.id
      };

      // 保存到数据库
      await catService.saveCat(updatedCat);

      // 更新状态
      setCurrentCat(updatedCat);

      // 跳转到仪表板
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '保存猫咪失败';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    navigate('/cat-generator');
  };

  const handleSuggestedName = (name: string) => {
    setCatName(name);
  };

  if (!user || !currentCat) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">数据错误</h2>
            <button
              onClick={() => navigate('/cat-generator')}
              className="generate-button"
            >
              重新生成猫咪
            </button>
          </div>
        </div>
      </div>
    );
  }

  const personalityTraits = generatePersonalityTraits(
    currentCat.config.breed,
    currentCat.config.age,
    currentCat.config.gender
  );

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 页面标题区域 */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="w-12 h-12 text-pink-500 relative">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <div className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 animate-sparkle">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            给你的猫咪取个名字吧！
          </h1>
          
          <p className="text-lg text-gray-600">
            这只可爱的猫咪即将成为你的伙伴，给它起一个特别的名字
          </p>
        </div>

        {/* 错误提示 */}
        {error && <ErrorMessage error={error} onClose={() => setError(null)} />}

        {/* 猫咪预览卡片 */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row">
            {/* 图片区域 */}
            <div className="md:w-1/2">
              <img
                src={currentCat.imageUrl}
                alt="生成的猫咪"
                className="w-full aspect-square object-cover"
              />
            </div>
            
            {/* 信息区域 */}
            <div className="md:w-1/2 p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">猫咪信息</h3>
                  <div className="space-y-2 text-gray-600">
                    <p><span className="font-medium">品种:</span> {getBreedLabel(currentCat.config.breed)}</p>
                    <p><span className="font-medium">年龄:</span> {getAgeLabel(currentCat.config.age)}</p>
                    <p><span className="font-medium">性别:</span> {getGenderLabel(currentCat.config.gender)}</p>
                  </div>
                </div>
                
                {/* 性格标签 */}
                <div>
                  <h4 className="text-lg font-medium text-gray-800 mb-2">性格特点</h4>
                  <div className="flex flex-wrap gap-2">
                    {personalityTraits.map((trait, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gradient-to-r from-orange-100 to-purple-100 text-orange-700 rounded-full text-xs font-medium"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 取名输入区域 */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-pink-100 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-5 h-5 text-pink-500">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">给猫咪取名</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="猫咪名字"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none text-lg"
                maxLength={20}
              />
              <p className="text-sm text-gray-500 mt-2">
                建议名字: {SUGGESTED_NAMES.join('、')}
              </p>
            </div>
            
            {/* 建议名字按钮 */}
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_NAMES.slice(0, 6).map((name) => (
                <button
                  key={name}
                  onClick={() => handleSuggestedName(name)}
                  className="px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-sm hover:bg-pink-100 transition-colors"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 操作按钮组 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleRegenerate}
            disabled={isLoading}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full font-medium hover:border-gray-400 transition-colors"
          >
            重新生成
          </button>
          
          <button
            onClick={handleSaveCat}
            disabled={isLoading || !catName.trim()}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-medium hover:scale-105 transition-all duration-300 shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <LoadingSpinner size="sm" text="保存中..." />
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span>确认领养</span>
              </div>
            )}
          </button>
        </div>

        {/* 返回按钮 */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
          >
            ← 返回仪表板
          </button>
        </div>
      </main>
    </div>
  );
};

// 辅助函数
function getBreedLabel(breed: string): string {
  const breedMap: Record<string, string> = {
    'british-shorthair': '英国短毛猫',
    'american-shorthair': '美国短毛猫',
    'persian': '波斯猫',
    'siamese': '暹罗猫',
    'maine-coon': '缅因猫',
    'ragdoll': '布偶猫'
  };
  return breedMap[breed] || breed;
}

function getAgeLabel(age: string): string {
  const ageMap: Record<string, string> = {
    'kitten': '幼猫(2-6个月)',
    'adult': '成年猫(2-7岁)',
    'senior': '老年猫(7岁以上)'
  };
  return ageMap[age] || age;
}

function getGenderLabel(gender: string): string {
  const genderMap: Record<string, string> = {
    'male': '公猫',
    'female': '母猫'
  };
  return genderMap[gender] || gender;
} 