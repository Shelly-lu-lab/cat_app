import React, { useState, useEffect } from 'react';
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

interface InteractCatProps {}

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
                <div className="w-8 h-8 text-orange-500">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                    <path d="M12 6c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                  </svg>
                </div>
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
            <div className="grid md:grid-cols-2 gap-6">
              {generatedVideos.map((video) => (
                <div key={video.id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100 group">
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                    {video.videoUrl ? (
                      <video 
                        src={video.videoUrl}
                        controls
                        className="w-full h-full object-cover"
                        poster={video.thumbnailUrl}
                      >
                        您的浏览器不支持视频播放
                      </video>
                    ) : (
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.command}
                        className="w-full h-full object-cover"
                      />
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