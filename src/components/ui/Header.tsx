import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 glass-effect">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            {/* Logo区域 */}
            <div className="relative">
              <div className="w-8 h-8 text-orange-500">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 text-pink-400 animate-pulse">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
            </div>
            
            {/* 标题区域 */}
            <div>
              <h1 className="text-2xl font-bold gradient-text">
                AI云养猫
              </h1>
              <p className="text-sm text-gray-600">
                你的专属AI宠物伙伴
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}; 