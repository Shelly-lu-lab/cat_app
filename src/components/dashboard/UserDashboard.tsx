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
      const userCats = await catService.getUserCats(user.id);
      setCats(userCats);
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
    navigate('/cat-generator');
  };

  const handleCatInteraction = (cat: CatInfo) => {
    // TODO: 实现猫咪互动功能
    console.log('与猫咪互动:', cat.name);
  };

  const handleViewCatDetails = (cat: CatInfo) => {
    // TODO: 实现猫咪详情页面
    console.log('查看猫咪详情:', cat.name);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 p-4">
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
              className="btn-secondary"
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
            <button 
              onClick={handleGenerateCat}
              className="btn-primary"
            >
              + 领养新猫咪
            </button>
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
                className="btn-primary"
              >
                立即领养
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cats.map((cat) => (
                <div key={cat.id} className="bg-gray-50 rounded-lg p-4">
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-lg mb-1">{cat.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {cat.config.breed} • {cat.config.age} • {cat.config.gender}
                  </p>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleCatInteraction(cat)}
                      className="btn-secondary text-sm flex-1"
                    >
                      互动
                    </button>
                    <button 
                      onClick={() => handleViewCatDetails(cat)}
                      className="btn-primary text-sm flex-1"
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