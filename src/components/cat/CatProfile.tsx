import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { catService } from '../../services/supabase/database';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';
import { Header } from '../ui/Header';

// 性格指数计算函数
function calculatePersonalityStats(breed: string, age: string, gender: string) {
  const stats = {
    friendliness: 0,
    playfulness: 0,
    independence: 0,
    intelligence: 0
  };

  // 基于品种计算
  const breedStats: Record<string, any> = {
    'british-shorthair': { friendliness: 70, playfulness: 50, independence: 80, intelligence: 75 },
    'american-shorthair': { friendliness: 85, playfulness: 75, independence: 70, intelligence: 80 },
    'persian': { friendliness: 60, playfulness: 40, independence: 85, intelligence: 70 },
    'siamese': { friendliness: 90, playfulness: 85, independence: 60, intelligence: 95 },
    'maine-coon': { friendliness: 95, playfulness: 80, independence: 65, intelligence: 85 },
    'ragdoll': { friendliness: 100, playfulness: 70, independence: 50, intelligence: 80 }
  };

  // 基于年龄调整
  const ageMultiplier: Record<string, number> = {
    'kitten': 1.2, // 幼猫更活泼
    'adult': 1.0,  // 成年猫标准
    'senior': 0.8  // 老年猫较安静
  };

  // 基于性别调整
  const genderMultiplier: Record<string, number> = {
    'male': 1.1,   // 公猫稍活跃
    'female': 0.9  // 母猫稍安静
  };

  const baseStats = breedStats[breed] || { friendliness: 70, playfulness: 60, independence: 70, intelligence: 75 };
  const ageMult = ageMultiplier[age] || 1.0;
  const genderMult = genderMultiplier[gender] || 1.0;
  const finalMult = ageMult * genderMult;

  stats.friendliness = Math.min(100, Math.round(baseStats.friendliness * finalMult));
  stats.playfulness = Math.min(100, Math.round(baseStats.playfulness * finalMult));
  stats.independence = Math.min(100, Math.round(baseStats.independence * finalMult));
  stats.intelligence = Math.min(100, Math.round(baseStats.intelligence * finalMult));

  return stats;
}

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
  
  const allTraits = [...breedTraits, ...ageTraitsList, ...genderTraitsList];
  const shuffled = allTraits.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}

export const CatProfile: React.FC = () => {
  const navigate = useNavigate();
  const { catId } = useParams<{ catId: string }>();
  const { user, isLoading, error, setLoading, setError } = useAppStore();
  const [cat, setCat] = useState<any>(null);
  const [isLoadingCat, setIsLoadingCat] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (catId && user) {
      loadCatDetails();
    }
  }, [catId, user]);

  const loadCatDetails = async () => {
    if (!catId || !user) return;
    
    try {
      setIsLoadingCat(true);
      const catDetails = await catService.getCatById(catId);
      if (catDetails && catDetails.user_id === user.id) {
        setCat(catDetails);
      } else {
        setError('猫咪不存在或无权限访问');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Failed to load cat details:', error);
      setError('加载猫咪详情失败');
      navigate('/dashboard');
    } finally {
      setIsLoadingCat(false);
    }
  };

  const handleEditCat = () => {
    // TODO: 实现编辑功能
    console.log('编辑猫咪:', cat.name);
  };

  const handleDeleteCat = async () => {
    if (!cat || !user) return;
    
    try {
      setLoading(true);
      await catService.deleteCat(cat.id);
      setShowDeleteConfirm(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to delete cat:', error);
      setError('删除猫咪失败');
    } finally {
      setLoading(false);
    }
  };

  const handleInteractWithCat = () => {
    navigate(`/interact/${catId}`);
  };

  if (!user) {
    return null;
  }

  if (isLoadingCat) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center p-4">
          <LoadingSpinner size="lg" text="加载猫咪档案..." />
        </div>
      </div>
    );
  }

  if (!cat) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">猫咪不存在</h2>
            <button
              onClick={() => navigate('/dashboard')}
              className="generate-button"
            >
              返回仪表板
            </button>
          </div>
        </div>
      </div>
    );
  }

  const personalityStats = calculatePersonalityStats(cat.config.breed, cat.config.age, cat.config.gender);
  const personalityTraits = generatePersonalityTraits(cat.config.breed, cat.config.age, cat.config.gender);

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 错误提示 */}
        {error && <ErrorMessage error={error} onClose={() => setError(null)} />}

        {/* 猫咪档案卡片 */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="md:flex">
            {/* 图片区域 */}
            <div className="md:w-1/2">
              <img
                src={cat.image_url}
                alt={cat.name}
                className="w-full aspect-square object-cover"
              />
            </div>
            
            {/* 信息区域 */}
            <div className="md:w-1/2 p-8">
              <div className="space-y-6">
                {/* 基本信息 */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{cat.name}</h1>
                  <div className="space-y-2 text-gray-600">
                    <p><span className="font-medium">品种:</span> {getBreedLabel(cat.config.breed)}</p>
                    <p><span className="font-medium">年龄:</span> {getAgeLabel(cat.config.age)}</p>
                    <p><span className="font-medium">性别:</span> {getGenderLabel(cat.config.gender)}</p>
                    <p><span className="font-medium">领养时间:</span> {new Date(cat.created_at).toLocaleDateString('zh-CN')}</p>
                  </div>
                </div>
                
                {/* 性格标签 */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">性格特点</h3>
                  <div className="flex flex-wrap gap-2">
                    {personalityTraits.map((trait, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gradient-to-r from-orange-100 to-purple-100 text-orange-700 rounded-full text-sm font-medium"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 性格指数 */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">性格指数</h3>
                  <div className="space-y-4">
                    {Object.entries(personalityStats).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-600 w-20">
                          {getStatLabel(key)}
                        </span>
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-orange-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                              style={{ width: `${value}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-800 w-12 text-right">
                          {value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮组 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={handleInteractWithCat}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-full font-medium hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <span>与猫咪互动</span>
            </div>
          </button>
          
          <button
            onClick={handleEditCat}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full font-medium hover:border-gray-400 transition-colors"
          >
            编辑信息
          </button>
          
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-1 px-6 py-3 border-2 border-red-300 text-red-600 rounded-full font-medium hover:border-red-400 transition-colors"
          >
            删除猫咪
          </button>
        </div>

        {/* 返回按钮 */}
        <div className="text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
          >
            ← 返回仪表板
          </button>
        </div>

        {/* 删除确认对话框 */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md mx-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">确认删除</h3>
              <p className="text-gray-600 mb-6">
                确定要删除猫咪 "{cat.name}" 吗？此操作无法撤销。
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleDeleteCat}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  {isLoading ? '删除中...' : '确认删除'}
                </button>
              </div>
            </div>
          </div>
        )}
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

function getStatLabel(key: string): string {
  const statMap: Record<string, string> = {
    'friendliness': '亲密度',
    'playfulness': '活泼度',
    'independence': '独立性',
    'intelligence': '聪明度'
  };
  return statMap[key] || key;
} 