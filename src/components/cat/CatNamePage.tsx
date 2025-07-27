import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { catService } from '../../services/supabase/database';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';

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

  if (!user || !currentCat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">数据错误</h2>
          <button
            onClick={() => navigate('/cat-generator')}
            className="btn-primary"
          >
            重新生成猫咪
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 p-4">
      <div className="max-w-md mx-auto">
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🐱 给你的猫咪起个名字
          </h1>
          <p className="text-gray-600">
            AI已经为你生成了专属猫咪，现在给它起个可爱的名字吧！
          </p>
        </div>

        {/* 猫咪展示 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="text-center mb-6">
            <img
              src={currentCat.imageUrl}
              alt="生成的猫咪"
              className="w-full max-w-xs mx-auto rounded-lg shadow-md mb-4"
            />
            <div className="text-sm text-gray-600">
              <p>品种: {currentCat.config.breed}</p>
              <p>年龄: {currentCat.config.age}</p>
              <p>性别: {currentCat.config.gender}</p>
            </div>
          </div>

          {/* 命名表单 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              猫咪名字
            </label>
            <input
              type="text"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="输入可爱的名字..."
              className="input-field w-full"
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">
              最多20个字符
            </p>
          </div>

          {error && (
            <ErrorMessage 
              error={error} 
              onClose={() => setError(null)} 
            />
          )}

          <div className="space-y-3">
            <button
              onClick={handleSaveCat}
              disabled={isLoading || !catName.trim()}
              className="btn-primary w-full"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">保存中...</span>
                </span>
              ) : (
                '保存猫咪'
              )}
            </button>

            <button
              onClick={handleRegenerate}
              disabled={isLoading}
              className="btn-secondary w-full"
            >
              重新生成
            </button>
          </div>
        </div>

        {/* 返回按钮 */}
        <div className="text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-orange-600 hover:text-orange-700 text-sm"
          >
            ← 返回仪表板
          </button>
        </div>
      </div>
    </div>
  );
}; 