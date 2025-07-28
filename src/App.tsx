import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './stores/appStore';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/auth/LoginPage';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { CatGenerator } from './components/cat/CatGenerator';
import { CatNamePage } from './components/cat/CatNamePage';
import { CatProfile } from './components/cat/CatProfile';
import { InteractCat } from './components/cat/InteractCat';

function App() {
  const { user, isLoading } = useAppStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 公开路由 */}
          <Route path="/" element={user ? <Navigate to="/generate" /> : <HomePage />} />
          <Route path="/login" element={user ? <Navigate to="/generate" /> : <LoginPage />} />
          
          {/* 需要认证的路由 */}
          <Route path="/dashboard" element={user ? <UserDashboard /> : <Navigate to="/login" />} />
          <Route path="/generate" element={user ? <CatGenerator /> : <Navigate to="/login" />} />
          <Route path="/name-cat" element={user ? <CatNamePage /> : <Navigate to="/login" />} />
          <Route path="/cat/:catId" element={user ? <CatProfile /> : <Navigate to="/login" />} />
          <Route path="/interact/:catId" element={user ? <InteractCat /> : <Navigate to="/login" />} />
          
          {/* 默认重定向 */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
