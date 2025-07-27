import React from 'react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🐱 AI云养猫
          </h1>
          <p className="text-gray-600">
            使用AI技术,创造属于你的虚拟猫咪伙伴
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-center mb-4">
            项目初始化完成! 🎉
          </h2>
          <p className="text-gray-600 text-center mb-6">
            接下来我们将实现用户认证、猫咪生成和视频互动功能。
          </p>
          
          <div className="text-center">
            <Link 
              to="/login"
              className="btn-primary inline-block"
            >
              开始体验
            </Link>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">测试页面</h3>
          <p className="text-sm text-gray-600 mb-2">如果你看到这个，说明页面正常渲染了！</p>
        </div>
      </div>
    </div>
  );
}; 