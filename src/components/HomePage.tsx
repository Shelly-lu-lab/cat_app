import React from 'react';
import { Link } from 'react-router-dom';

// 简笔画猫咪头SVG组件
const CatLogo: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
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

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <CatLogo className="w-16 h-16 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">
              AI云养猫
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            使用AI技术，创造属于你的虚拟猫咪伙伴
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6 border border-gray-100">
          <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800">
            项目初始化完成! 🎉
          </h2>
          <p className="text-gray-600 text-center mb-8 leading-relaxed">
            接下来我们将实现用户认证、猫咪生成和视频互动功能。
          </p>
          
          <div className="text-center">
            <Link 
              to="/login"
              className="inline-block bg-gradient-to-r from-orange-500 to-purple-600 text-white px-8 py-4 rounded-full font-medium hover:scale-105 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              开始体验
            </Link>
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">测试页面</h3>
          <p className="text-sm text-gray-600 mb-4">如果你看到这个，说明页面正常渲染了！</p>
          <div className="text-xs text-gray-500">
            <p>✨ 新功能：</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>全新的登录界面设计</li>
              <li>渐变色彩和毛玻璃效果</li>
              <li>响应式设计优化</li>
              <li>流畅的动画效果</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}; 