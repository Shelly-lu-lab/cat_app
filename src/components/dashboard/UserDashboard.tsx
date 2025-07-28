import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/supabase/auth';
import { catService } from '../../services/supabase/database';
import { useAppStore } from '../../stores/appStore';
import type { CatInfo } from '../../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';

export const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser, isLoading, error, setLoading, setError } = useAppStore();
  const [cats, setCats] = useState<CatInfo[]>([]);
  const [isLoadingCats, setIsLoadingCats] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserCats();
    }
  }, [user]);

  const loadUserCats = async () => {
    if (!user) return;
    
    try {
      setIsLoadingCats(true);
      console.log('开始加载用户猫咪，用户:', user);
      
      const userCats = await catService.getUserCats(user.id);
      console.log('加载到的猫咪数据:', userCats);
      
      // 验证数据完整性
      const validCats = userCats.filter(cat => {
        const isValid = cat && cat.id && cat.name && cat.imageUrl;
        if (!isValid) {
          console.warn('发现无效的猫咪数据:', cat);
        }
        return isValid;
      });
      
      console.log('过滤后的有效猫咪数据:', validCats);
      setCats(validCats);
    } catch (error) {
      console.error('Failed to load cats:', error);
      setError('加载猫咪列表失败');
    } finally {
      setIsLoadingCats(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out failed:', error);
      setError('退出登录失败');
    }
  };

  const handleGenerateCat = () => {
    navigate('/generate');
  };

  const handleCatInteraction = (cat: CatInfo) => {
    navigate(`/interact/${cat.id}`);
  };

  const handleViewCatDetails = (cat: CatInfo) => {
    navigate(`/cat/${cat.id}`);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                🐱 欢迎回来，{user.email}
              </h1>
              <p className="text-gray-600">
                你目前有 {cats.length} 只猫咪
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-full hover:border-gray-400 transition-all duration-300"
            >
              退出登录
            </button>
          </div>
        </div>

        {/* 猫咪列表 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              我的猫咪们
            </h2>
            <div className="flex space-x-2">
              <button 
                onClick={loadUserCats}
                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-full text-sm hover:border-gray-400 transition-all duration-300"
              >
                🔄 刷新
              </button>
              <button 
                onClick={handleGenerateCat}
                className="bg-gradient-to-r from-orange-500 to-purple-600 text-white px-6 py-3 rounded-full font-medium hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                + 领养新猫咪
              </button>
            </div>
          </div>

          {isLoadingCats ? (
            <div className="text-center py-8">
              <LoadingSpinner size="lg" text="加载中..." />
            </div>
          ) : cats.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🐱</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                还没有猫咪
              </h3>
              <p className="text-gray-600 mb-4">
                点击上方按钮开始领养你的第一只猫咪吧！
              </p>
              <button
                onClick={handleGenerateCat}
                className="bg-gradient-to-r from-orange-500 to-purple-600 text-white px-6 py-3 rounded-full font-medium hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                立即领养
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cats.map((cat) => (
                <div key={cat.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-all duration-300">
                  <img
                    src={`${cat.imageUrl}?t=${Date.now()}`}
                    alt={cat.name}
                    className="w-full h-48 object-cover rounded-lg mb-3"
                    onError={(e) => {
                      console.log('图片加载失败:', cat.imageUrl);
                      console.log('猫咪信息:', cat);
                      // 如果图片加载失败，可以设置一个默认图片
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop';
                    }}
                    onLoad={() => {
                      console.log('图片加载成功:', cat.imageUrl);
                    }}
                  />
                  <h3 className="font-semibold text-lg mb-1">{cat.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {cat.config.breed} • {cat.config.age} • {cat.config.gender}
                  </p>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleCatInteraction(cat)}
                      className="flex-1 px-3 py-2 border-2 border-gray-300 text-gray-700 rounded-full text-sm hover:border-purple-300 hover:text-purple-700 transition-all duration-300"
                    >
                      互动
                    </button>
                    <button 
                      onClick={() => handleViewCatDetails(cat)}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full text-sm hover:scale-105 transform transition-all duration-300"
                    >
                      查看详情
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <ErrorMessage 
            error={error} 
            onClose={() => setError(null)} 
          />
        )}
      </div>
    </div>
  );
}; 