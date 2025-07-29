import React, { useState } from 'react';
import { authService } from '../../services/supabase/auth';
import { useAppStore } from '../../stores/appStore';
import { useNavigate } from 'react-router-dom';
import { 
  XMarkIcon, 
  EnvelopeIcon, 
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import type { User } from '../../types';

// 简笔画猫咪头SVG组件
const CatLogo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
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

export const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showTestUser, setShowTestUser] = useState(false);
  
  const { setUser, setLoading, setError: setAppError } = useAppStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // 注册模式下的密码确认验证
    if (!isLogin && password !== confirmPassword) {
      setMessage({ type: 'error', text: '两次输入的密码不一致' });
      setIsLoading(false);
      return;
    }

    try {
      let user: User;
      if (isLogin) {
        user = await authService.signInWithEmail(email, password);
        setMessage({ type: 'success', text: '登录成功！' });
      } else {
        user = await authService.signUpWithEmail(email, password);
        setMessage({ type: 'success', text: '注册成功！' });
      }
      
      setUser(user);
      setAppError(null);
      
      // 1-2秒后自动跳转
      setTimeout(() => {
        navigate('/generate');
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '操作失败';
      setMessage({ type: 'error', text: errorMessage });
      setAppError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestUser = async (testEmail: string, testPassword: string) => {
    setEmail(testEmail);
    setPassword(testPassword);
    setIsLogin(true);
    
    // 自动提交
    const form = document.querySelector('form');
    if (form) {
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);
    }
  };

  const closeModal = () => {
    // 这里可以添加关闭模态框的逻辑
    // 目前是登录页面，所以暂时不实现关闭功能
  };

  return (
    // 固定定位的全屏遮罩层，背景为黑色半透明加毛玻璃效果
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      {/* 居中显示的白色圆角卡片，最大宽度md，具有阴影效果 */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative">
        {/* 头部区域 - 渐变背景 */}
        <div className="bg-gradient-to-r from-orange-500 to-purple-600 text-white p-6 rounded-t-2xl relative">
          {/* 右上角关闭按钮 */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          
          {/* 左侧猫咪logo */}
          <div className="flex items-center">
            <CatLogo className="w-8 h-8 mr-3" />
            <div>
              {/* 标题文字 */}
              <h2 className="text-2xl font-bold">
                {isLogin ? '登录账户' : '注册账户'}
              </h2>
              {/* 副标题 */}
              <p className="text-white/80 text-sm mt-1">
                {isLogin ? '欢迎回到AI云养猫' : '加入AI云养猫大家庭'}
              </p>
            </div>
          </div>
        </div>

        {/* 表单区域 - 白色背景 */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 邮箱输入框 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                邮箱地址
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors duration-200"
                  placeholder="输入你的邮箱地址"
                  required
                />
              </div>
            </div>

            {/* 密码输入框 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors duration-200"
                  placeholder="输入密码"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* 确认密码输入框（仅注册模式） */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  确认密码
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors duration-200"
                    placeholder="再次输入密码"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            )}

            {/* 消息提示区域 */}
            {message && (
              <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  <ExclamationCircleIcon className="w-5 h-5" />
                )}
                <span className="text-sm">{message.text}</span>
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-all duration-200 ${
                isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 hover:scale-105 shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isLogin ? '登录中...' : '注册中...'}
                </span>
              ) : (
                isLogin ? '登录' : '注册'
              )}
            </button>
          </form>

          {/* 开发阶段测试用户 */}
          <div className="mt-4">
            <button
              onClick={() => setShowTestUser(!showTestUser)}
              className="text-orange-500 hover:text-orange-600 text-sm"
            >
              {showTestUser ? '隐藏' : '显示'}测试用户
            </button>
            
            {showTestUser && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">测试用户（开发用）</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleTestUser('test@example.com', '123456')}
                    className="block w-full text-left text-sm text-blue-600 hover:text-blue-700 p-2 rounded bg-blue-50"
                  >
                    📧 test@example.com / 123456
                  </button>
                  <p className="text-xs text-gray-500">
                    注意：这是测试账号，实际使用时请注册真实邮箱
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 底部切换区域 */}
          <div className="mt-6 text-center">
            <span className="text-gray-600 text-sm">
              {isLogin ? '还没有账户？' : '已有账户？'}
            </span>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage(null);
                setConfirmPassword('');
              }}
              className="text-orange-500 hover:text-orange-600 text-sm ml-1 transition-colors duration-200"
            >
              {isLogin ? '立即注册' : '立即登录'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 