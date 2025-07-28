import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { catService } from '../../services/supabase/database';
import { 
  HeartIcon, 
  PencilIcon, 
  TrashIcon, 
  PlayIcon,
  StarIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface CatProfileProps {}

export const CatProfile: React.FC<CatProfileProps> = () => {
  const { catId } = useParams<{ catId: string }>();
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [cat, setCat] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 获取猫咪信息
  React.useEffect(() => {
    if (catId) {
      catService.getCatById(catId)
        .then(catData => {
          setCat(catData);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [catId]);

  // 删除猫咪
  const handleDeleteCat = async () => {
    if (!catId) return;
    
    try {
      await catService.deleteCat(catId);
      navigate('/dashboard');
    } catch (err) {
      setError('删除失败，请重试');
    }
  };

  // 计算性格指数
  const calculatePersonalityStats = (cat: any) => {
    const name = cat.name || '';
    const breed = cat.breed || '';
    
    // 基于名字和品种计算性格指数
    const friendliness = Math.min(100, Math.max(20, (name.length * 5 + breed.length * 3) % 100));
    const liveliness = Math.min(100, Math.max(30, (name.length * 4 + breed.length * 4) % 100));
    const independence = Math.min(100, Math.max(40, (name.length * 6 + breed.length * 2) % 100));
    
    return { friendliness, liveliness, independence };
  };

  // 获取性格标签
  const getPersonalityTraits = (cat: any) => {
    const stats = calculatePersonalityStats(cat);
    const traits = [];
    
    if (stats.friendliness > 70) traits.push('友善');
    if (stats.liveliness > 70) traits.push('活泼');
    if (stats.independence > 70) traits.push('独立');
    if (stats.friendliness > 60 && stats.liveliness > 60) traits.push('温柔');
    if (stats.independence > 60) traits.push('安静');
    if (stats.friendliness > 50 && stats.independence > 50) traits.push('优雅');
    
    return traits.length > 0 ? traits : ['可爱', '温顺', '乖巧'];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !cat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || '猫咪信息不存在'}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-full hover:scale-105 transition-all duration-300"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const personalityStats = calculatePersonalityStats(cat);
  const personalityTraits = getPersonalityTraits(cat);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="w-8 h-8 text-orange-500">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  <path d="M12 6c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 text-pink-400 animate-pulse">
                <HeartIcon />
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
              AI云养猫
            </h1>
          </div>
          <p className="text-sm text-gray-600 mt-1">你的专属AI宠物伙伴</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Cat Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="md:flex">
            {/* Cat Image Section */}
            <div className="md:w-1/2 relative">
              <img 
                src={cat.image_url} 
                alt={cat.name}
                className="w-full aspect-square object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700">
                  <HeartIcon className="w-3 h-3 mr-1" />
                  新成员
                </span>
              </div>
            </div>

            {/* Cat Information Section */}
            <div className="md:w-1/2 p-8">
              {/* Basic Info */}
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{cat.name}</h2>
                <p className="text-lg text-gray-600 mb-4">{cat.breed}</p>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="font-medium w-16">年龄:</span>
                    <span>{cat.age}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-16">性别:</span>
                    <span>{cat.gender}</span>
                  </div>
                </div>
              </div>

              {/* Personality Traits */}
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <StarIcon className="w-5 h-5 text-orange-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">性格特点</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {personalityTraits.map((trait, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-gradient-to-r from-orange-100 to-purple-100 text-orange-700 rounded-full text-sm"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              {/* Personality Index */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <InformationCircleIcon className="w-5 h-5 text-purple-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">性格指数</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">友善度</span>
                      <span className="text-sm font-medium text-gray-800">{personalityStats.friendliness}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${personalityStats.friendliness}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">活泼度</span>
                      <span className="text-sm font-medium text-gray-800">{personalityStats.liveliness}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${personalityStats.liveliness}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">独立性</span>
                      <span className="text-sm font-medium text-gray-800">{personalityStats.independence}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${personalityStats.independence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button 
                  onClick={() => navigate(`/interact/${catId}`)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-6 rounded-full font-medium hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  与猫咪互动
                </button>
                
                <div className="flex space-x-3">
                  <button 
                    onClick={() => navigate(`/edit/${catId}`)}
                    className="flex-1 flex items-center justify-center py-2 px-4 border-2 border-gray-300 text-gray-700 rounded-full hover:border-purple-300 hover:text-purple-700 transition-all duration-300"
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    编辑信息
                  </button>
                  
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex-1 flex items-center justify-center py-2 px-4 border-2 border-red-300 text-red-700 rounded-full hover:border-red-400 hover:text-red-800 transition-all duration-300"
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    删除猫咪
                  </button>
                </div>
                
                <button 
                  onClick={() => navigate('/generate')}
                  className="w-full bg-gradient-to-r from-orange-500 to-purple-600 text-white py-3 px-6 rounded-full font-medium hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  + 领养新猫咪
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">确认删除</h3>
            <p className="text-gray-600 mb-6">确定要删除 {cat.name} 吗？此操作无法撤销。</p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 px-4 border-2 border-gray-300 text-gray-700 rounded-full hover:border-gray-400 transition-all duration-300"
              >
                取消
              </button>
              <button 
                onClick={handleDeleteCat}
                className="flex-1 py-2 px-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-300"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 