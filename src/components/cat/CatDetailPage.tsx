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
  ArrowLeftIcon,
  StarIcon,
  InformationCircleIcon,
  PlusIcon
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

// 响应式视频组件
const ResponsiveVideo: React.FC<{ 
  videoUrl: string; 
  posterUrl?: string; 
  alt?: string;
}> = ({ videoUrl, posterUrl, alt }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [aspectRatio, setAspectRatio] = useState<number>(1);

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
      className="relative w-full rounded-lg overflow-hidden bg-black shadow-lg"
      style={{ 
        aspectRatio: `${aspectRatio}`,
        maxHeight: '60vh'
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

interface CatDetailPageProps {}

// 视频历史记录项类型定义
interface VideoHistoryItem {
  id: string;           // 唯一标识
  videoUrl: string;     // 视频URL
  prompt: string;       // 生成指令
  timestamp: Date;      // 生成时间
  status: 'generating' | 'completed' | 'failed';  // 状态
  error?: string;       // 错误信息（如果有）
}

export const CatDetailPage: React.FC<CatDetailPageProps> = () => {
  const { catId } = useParams<{ catId: string }>();
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [cat, setCat] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 互动相关状态
  const [interactionInput, setInteractionInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  
  // 视频历史记录状态
  const [videoHistory, setVideoHistory] = useState<VideoHistoryItem[]>([]);

  // 获取猫咪信息
  useEffect(() => {
    if (catId) {
      catService.getCatById(catId)
        .then(catData => {
          setCat(catData);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [catId]);

  // 计算性格指数
  const calculatePersonalityStats = (cat: any) => {
    const name = cat.name || '';
    const breed = cat.breed || '';
    
    const friendliness = Math.min(100, Math.max(20, (name.length * 5 + breed.length * 3) % 100));
    const liveliness = Math.min(100, Math.max(30, (name.length * 4 + breed.length * 4) % 100));
    const independence = Math.min(100, Math.max(40, (name.length * 6 + breed.length * 2) % 100));
    
    return { friendliness, liveliness, independence };
  };

  // 获取性格标签
  const getPersonalityTraits = (cat: any) => {
    const stats = calculatePersonalityStats(cat);
    const traits = [];
    
    if (stats.friendliness > 70) traits.push('友善');
    if (stats.liveliness > 70) traits.push('活泼');
    if (stats.independence > 70) traits.push('独立');
    if (stats.friendliness > 60 && stats.liveliness > 60) traits.push('温柔');
    if (stats.independence > 60) traits.push('安静');
    if (stats.friendliness > 50 && stats.independence > 50) traits.push('优雅');
    
    return traits.length > 0 ? traits : ['可爱', '温顺', '乖巧'];
  };

  // 生成视频
  const handleGenerateVideo = async () => {
    if (!interactionInput.trim() || !cat) return;
    
    setIsGenerating(true);
    setVideoError(null);
    
    // 创建新的视频历史记录项
    const newVideoId = generateUniqueId();
    const newVideoItem: VideoHistoryItem = {
      id: newVideoId,
      videoUrl: '',
      prompt: interactionInput,
      timestamp: new Date(),
      status: 'generating'
    };
    
    // 将新视频项添加到历史记录的最前面，限制最多显示10个视频
    setVideoHistory(prev => [newVideoItem, ...prev.slice(0, 9)]);
    
    try {
      const result = await tongyiVideoService.generateVideo({
        imageUrl: cat.image_url,
        prompt: interactionInput,
        duration: 3
      });
      
      if (result.status === 'completed' && result.videoUrl) {
        // 更新视频历史记录项
        setVideoHistory(prev => prev.map(item => 
          item.id === newVideoId 
            ? { ...item, videoUrl: result.videoUrl!, status: 'completed' }
            : item
        ));
      } else if (result.status === 'failed') {
        // 更新失败状态
        setVideoHistory(prev => prev.map(item => 
          item.id === newVideoId 
            ? { ...item, status: 'failed', error: result.error || '视频生成失败' }
            : item
        ));
        setVideoError(result.error || '视频生成失败');
      } else {
        // 更新异常状态
        setVideoHistory(prev => prev.map(item => 
          item.id === newVideoId 
            ? { ...item, status: 'failed', error: '视频生成状态异常' }
            : item
        ));
        setVideoError('视频生成状态异常');
      }
    } catch (err: any) {
      // 更新错误状态
      setVideoHistory(prev => prev.map(item => 
        item.id === newVideoId 
          ? { ...item, status: 'failed', error: err.message || '视频生成失败' }
          : item
      ));
      setVideoError(err.message || '视频生成失败');
    } finally {
      setIsGenerating(false);
    }
  };

  // 选择预设指令
  const handleSelectCommand = (selectedCommand: string) => {
    setInteractionInput(selectedCommand);
  };

  // 滚动到互动区域
  const scrollToInteraction = () => {
    document.getElementById('interaction-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  // 生成唯一ID
  const generateUniqueId = () => {
    return `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // 删除单个视频
  const handleDeleteVideo = (videoId: string) => {
    setVideoHistory(prev => prev.filter(item => item.id !== videoId));
  };

  // 清空所有历史记录
  const handleClearHistory = () => {
    setVideoHistory([]);
  };

  // 重新生成视频
  const handleRegenerateVideo = async (videoItem: VideoHistoryItem) => {
    if (!cat) return;
    
    // 删除原视频项
    setVideoHistory(prev => prev.filter(item => item.id !== videoItem.id));
    
    // 设置输入框为原指令
    setInteractionInput(videoItem.prompt);
    
    // 触发生成
    setTimeout(() => {
      handleGenerateVideo();
    }, 100);
  };

  // 预设指令列表
  const suggestedCommands = [
    '跳上沙发', '伸个懒腰', '晒太阳', '舔爪子',
    '抓抓板', '爬猫爬架', '翻滚一下', '玩毛线球',
    '喝水', '打哈欠', '追激光笔', '看窗外'
  ];

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

  if (error || !cat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || '猫咪信息不存在'}</p>
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

  const personalityStats = calculatePersonalityStats(cat);
  const personalityTraits = getPersonalityTraits(cat);

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
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
                  AI云养猫
                </h1>
                <p className="text-xs text-gray-500">你的专属AI宠物伙伴</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>返回</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* 猫咪信息区域 */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6">
            {/* 猫咪图片和基本信息 */}
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-1/2">
                <div className="relative">
                  <img 
                    src={cat.image_url} 
                    alt={cat.name}
                    className="w-full h-64 lg:h-80 object-cover rounded-xl shadow-md"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
                    <HeartIcon className="w-6 h-6 text-pink-500" />
                  </div>
                </div>
              </div>
              
              <div className="lg:w-1/2 space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">{cat.name}</h2>
                  <p className="text-lg text-gray-600 capitalize">{cat.breed}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600">年龄:</span>
                    <span className="font-medium capitalize">{cat.age}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600">性别:</span>
                    <span className="font-medium capitalize">{cat.gender}</span>
                  </div>
                </div>

                {/* 性格特点 */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <StarIcon className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold text-gray-800">性格特点</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {personalityTraits.map((trait, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 性格指数 */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <InformationCircleIcon className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-800">性格指数</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>友善度</span>
                        <span>{personalityStats.friendliness}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${personalityStats.friendliness}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>活泼度</span>
                        <span>{personalityStats.liveliness}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${personalityStats.liveliness}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>独立性</span>
                        <span>{personalityStats.independence}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${personalityStats.independence}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="space-y-4 pt-4">
                  <button 
                    onClick={scrollToInteraction}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 px-6 rounded-full font-medium hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
                  >
                    与猫咪互动
                  </button>
                  
                  <button 
                    onClick={() => navigate('/generate')}
                    className="w-full bg-gradient-to-r from-orange-500 to-purple-600 text-white py-4 px-6 rounded-full font-medium hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
                  >
                    <PlusIcon className="w-5 h-5 inline mr-2" />
                    领养新猫咪
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 互动区域 */}
        <div id="interaction-section" className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <VideoCameraIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">与{cat.name}互动</h3>
                <p className="text-gray-600">输入指令，AI将生成{cat.name}执行动作的专属视频</p>
              </div>
            </div>

            {/* 输入区域 */}
            <div className="flex space-x-3 mb-6">
              <input
                type="text"
                value={interactionInput}
                onChange={(e) => setInteractionInput(e.target.value)}
                placeholder="输入你想让猫咪做的动作"
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-full focus:border-purple-300 focus:outline-none transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && handleGenerateVideo()}
              />
              <button
                onClick={handleGenerateVideo}
                disabled={isGenerating || !interactionInput.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>生成中...</span>
                  </>
                ) : (
                  <>
                    <PlayIcon className="w-5 h-5" />
                    <span>生成视频</span>
                  </>
                )}
              </button>
            </div>

            {/* 建议指令 */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">建议指令:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {suggestedCommands.map((command, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectCommand(command)}
                    className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition-colors text-sm font-medium"
                  >
                    {command}
                  </button>
                ))}
              </div>
            </div>

            {/* 视频历史记录展示区域 */}
            {videoHistory.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-800">互动记录</h4>
                  <span className="text-sm text-gray-500">
                    共 {videoHistory.length} 个互动
                  </span>
                </div>
                <div className="space-y-4">
                  {videoHistory.map((videoItem) => (
                    <div key={videoItem.id} className="bg-gray-50 rounded-lg p-4">
                      {/* 视频信息头部 */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <VideoCameraIcon className="w-5 h-5 text-purple-600" />
                          <span className="font-medium text-gray-800">
                            指令: "{videoItem.prompt}"
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {videoItem.timestamp.toLocaleString()}
                        </div>
                      </div>
                      
                      {/* 视频状态和内容 */}
                      {videoItem.status === 'generating' && (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                            <p className="text-gray-600">正在生成视频...</p>
                          </div>
                        </div>
                      )}
                      
                                             {videoItem.status === 'completed' && videoItem.videoUrl && (
                         <div className="space-y-3">
                           <ResponsiveVideo 
                             videoUrl={videoItem.videoUrl} 
                             posterUrl={cat.image_url}
                             alt={`${cat.name}执行${videoItem.prompt}的视频`}
                           />
                           <div className="flex justify-center space-x-2">
                             <button
                               onClick={() => handleRegenerateVideo(videoItem)}
                               className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors text-sm"
                             >
                               重新生成
                             </button>
                             <button
                               onClick={() => handleDeleteVideo(videoItem.id)}
                               className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors text-sm"
                             >
                               删除
                             </button>
                           </div>
                         </div>
                       )}
                      
                      {videoItem.status === 'failed' && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-red-600 text-sm">
                            生成失败: {videoItem.error || '未知错误'}
                          </p>
                          <button
                            onClick={() => handleDeleteVideo(videoItem.id)}
                            className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors text-xs"
                          >
                            删除
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* 清空历史记录按钮 */}
                {videoHistory.length > 1 && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={handleClearHistory}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors text-sm"
                    >
                      清空所有历史记录
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 错误提示 */}
            {videoError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{videoError}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 