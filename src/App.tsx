import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './stores/appStore';
import { authService } from './services/supabase/auth';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ErrorMessage } from './components/ui/ErrorMessage';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/auth/LoginPage';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { CatGenerator } from './components/cat/CatGenerator';
import { CatNamePage } from './components/cat/CatNamePage';
import { CatProfile } from './components/cat/CatProfile';

function App() {
  const { user, setUser, isLoading, error, setLoading, setError } = useAppStore();

  useEffect(() => {
    // 检查当前用户会话
    const checkUser = async () => {
      try {
        setLoading(true);
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to check user session:', error);
        // 不要设置错误状态，让用户继续使用应用
        setUser(null); // Set user to null on error to allow app to render
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // 监听认证状态变化
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 flex items-center justify-center">
        <LoadingSpinner size="lg" text="加载中..." />
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {error && (
          <ErrorMessage 
            error={error} 
            onClose={() => setError(null)} 
          />
        )}
        
        <Routes>
          <Route 
            path="/" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <HomePage />
            } 
          />
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <LoginPage />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              user ? <UserDashboard /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/cat-generator" 
            element={
              user ? <CatGenerator /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/cat-name" 
            element={
              user ? <CatNamePage /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/cat/:catId" 
            element={
              user ? <CatProfile /> : <Navigate to="/login" replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
