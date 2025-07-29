import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { catService } from '../../services/supabase/database';
import { storageService } from '../../services/supabase/storage';
import { tongyiVideoService } from '../../services/ai/tongyi-video';
import { 
  HeartIcon, 
  VideoCameraIcon,
  SparklesIcon,
  PaperAirplaneIcon,
  PlayIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

// 简笔画猫咪头SVG组件 - 与其他页面保持一致
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

interface InteractCatProps {}

// 响应式视频组件
const ResponsiveVideo: React.FC<{ 
  videoUrl: string; 
  posterUrl?: string; 
  alt?: string;
}> = ({ videoUrl, posterUrl, alt }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [aspectRatio, setAspectRatio] = useState<number>(1); // 默认1:1比例

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleLoadedMetadata = () => {
        const ratio = video.videoWidth / video.videoHeight;
        setAspectRatio(ratio);
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [videoUrl]);

  return (
    <div 
      className="relative w-full rounded-lg overflow-hidden bg-black"
      style={{ 
        aspectRatio: `${aspectRatio}`,
        maxHeight: '70vh' // 限制最大高度为视口高度的70%
      }}
    >
      <video 
        ref={videoRef}
        src={videoUrl}
        controls
        className="w-full h-full object-contain"
        poster={posterUrl}
        style={{
          width: '100%',
          height: '100%'
        }}
      >
        您的浏览器不支持视频播放
      </video>
    </div>
  );
};

export const InteractCat: React.FC<InteractCatProps> = () => {
  const { catId } = useParams<{ catId: string }>();
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [cat, setCat] = useState<any>(null);
  const [command, setCommand] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 建议指令
  const suggestedCommands = [
    '跳上沙发', '翻滚一下', '伸个懒腰', '玩毛线球',
    '晒太阳', '喝水', '舔爪子', '打哈欠',
    '抓抓板', '追激光笔', '爬猫爬架', '看窗外'
  ];

  // 获取猫咪信息
  useEffect(() => {
    if (catId) {
      catService.getCatById(catId)
        .then(catData => {
          setCat(catData);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load cat:', err);
          setLoading(false);
        });
    }
  }, [catId]);

  // 生成视频
  const handleGenerateVideo = async () => {
    if (!command.trim() || !cat) return;

    setIsGenerating(true);
    
    try {
      console.log('开始生成视频:', { command, catImageUrl: cat.image_url });
      
      // 调用通义万相视频生成API
      const result = await tongyiVideoService.generateVideo({
        imageUrl: cat.image_url,
        prompt: command,
        duration: 3
      });
      
      if (result.status === 'completed' && result.videoUrl) {
        console.log('视频生成成功:', result.videoUrl);
        
        // 上传视频到Supabase Storage
        const timestamp = Date.now();
        const fileName = `video_${catId}_${timestamp}.mp4`;
        
        console.log('开始上传视频到Supabase Storage');
        const uploadedVideoUrl = await storageService.uploadVideo(result.videoUrl, fileName);
        console.log('视频上传成功:', uploadedVideoUrl);
        
        const newVideo = {
          id: Date.now(),
          command: command,
          videoUrl: uploadedVideoUrl, // 使用上传后的URL
          thumbnailUrl: cat.image_url,
          createdAt: new Date()
        };
        
        setGeneratedVideos(prev => [newVideo, ...prev]);
        setCommand('');
      } else {
        throw new Error(result.error || '视频生成失败');
      }
    } catch (error) {
      console.error('视频生成失败:', error);
      // 可以在这里添加错误提示
    } finally {
      setIsGenerating(false);
    }
  };

  // 选择建议指令
  const handleSelectCommand = (selectedCommand: string) => {
    setCommand(selectedCommand);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!cat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">猫咪信息不存在</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-full hover:scale-105 transition-all duration-300"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <CatLogo className="w-8 h-8" />
                <div className="absolute -top-1 -right-1 w-4 h-4 text-pink-400 animate-pulse">
                  <HeartIcon />
                </div>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
                AI云养猫
              </h1>
            </div>
            <button 
              onClick={() => navigate(`/cat/${catId}`)}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>返回</span>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">你的专属AI宠物伙伴</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Familiarity Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">亲密度</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: '87%' }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-800">87%</span>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex space-x-3 mb-6">
          <button 
            onClick={() => navigate('/generate')}
            className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-full hover:border-orange-300 hover:text-orange-700 transition-all duration-300"
          >
            重新领养
          </button>
          <button 
            className="flex-1 py-3 px-4 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-all duration-300"
          >
            互动玩耍
          </button>
        </div>

        {/* Interact Card */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100 mb-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <VideoCameraIcon className="w-8 h-8 text-purple-500 mr-2" />
              <SparklesIcon className="w-6 h-6 text-yellow-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">与{cat.name}互动</h2>
            <p className="text-gray-600">输入指令，AI将生成{cat.name}执行动作的专属视频</p>
          </div>

          {/* Command Input */}
          <div className="flex space-x-3 mb-6">
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="输入你想让猫咪做的动作"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all duration-300"
              disabled={isGenerating}
            />
            <button
              onClick={handleGenerateVideo}
              disabled={!command.trim() || isGenerating}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
              <span>生成视频</span>
            </button>
          </div>

          {/* Suggested Commands */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">建议指令:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {suggestedCommands.map((cmd, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectCommand(cmd)}
                  className="px-3 py-2 bg-purple-50 text-purple-600 rounded-full text-sm hover:bg-purple-100 transition-all duration-300"
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>

          {/* Generation Progress */}
          {isGenerating && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="animate-bounce">
                  <SparklesIcon className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              <p className="text-center text-gray-700 mb-4">正在生成{cat.name}的视频...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
        </div>

        {/* Video History */}
        {generatedVideos.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">视频历史</h3>
            <div className="space-y-6">
              {generatedVideos.map((video) => (
                <div key={video.id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100 group">
                  {/* 响应式视频容器 - 宽度100%，高度根据视频比例自动调整 */}
                  <div className="mb-3">
                    {video.videoUrl ? (
                      <ResponsiveVideo 
                        videoUrl={video.videoUrl}
                        posterUrl={video.thumbnailUrl}
                        alt={video.command}
                      />
                    ) : (
                      <div className="relative w-full rounded-lg overflow-hidden bg-gray-100" style={{ aspectRatio: '1/1' }}>
                        <img 
                          src={video.thumbnailUrl} 
                          alt={video.command}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-700">
                    <p className="font-medium mb-1">"{video.command}"</p>
                    <p className="text-gray-500">{video.createdAt.toLocaleDateString('zh-CN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white/80 backdrop-blur-md border-t border-orange-100 mt-8">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-gray-600 mb-2">Made with ❤️ for cat lovers</p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <span className="flex items-center space-x-1">
                <span>📦</span>
                <span>开源代码</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>✓</span>
                <span>关注我们</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              © 2024 AI云养猫,让每一只虚拟猫咪都能被好好爱护。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 