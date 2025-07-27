import React, { useState } from 'react';
import { authService } from '../../services/supabase/auth';
import { useAppStore } from '../../stores/appStore';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ErrorMessage } from '../ui/ErrorMessage';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { User } from '../../types';

export const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTestUser, setShowTestUser] = useState(false);
  
  const { setUser, setLoading, setError: setAppError } = useAppStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let user: User;
      if (isLogin) {
        user = await authService.signInWithEmail(email, password);
      } else {
        user = await authService.signUpWithEmail(email, password);
      }
      
      setUser(user);
      setAppError(null);
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '操作失败';
      setError(errorMessage);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🐱 AI云养猫
          </h1>
          <p className="text-gray-600">
            {isLogin ? '欢迎回来！' : '开始你的云养猫之旅'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-center mb-6">
            {isLogin ? '登录' : '注册'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                邮箱地址
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full"
                placeholder="请输入邮箱地址"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full"
                placeholder="请输入密码"
                required
                minLength={6}
              />
            </div>

            {error && (
              <ErrorMessage 
                error={error} 
                onClose={() => setError(null)} 
              />
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">处理中...</span>
                </span>
              ) : (
                isLogin ? '登录' : '注册'
              )}
            </button>
          </form>

          {/* 开发阶段测试用户 */}
          <div className="mt-6">
            <button
              onClick={() => setShowTestUser(!showTestUser)}
              className="text-orange-600 hover:text-orange-700 text-sm"
            >
              {showTestUser ? '隐藏' : '显示'}测试用户
            </button>
            
            {showTestUser && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
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

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-orange-600 hover:text-orange-700 text-sm"
            >
              {isLogin ? '还没有账号？点击注册' : '已有账号？点击登录'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 