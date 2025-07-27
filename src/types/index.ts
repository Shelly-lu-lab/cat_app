// 用户相关类型
export interface User {
  id: string;
  email: string;
  createdAt: Date;
}

// 猫咪配置类型
export interface CatConfig {
  breed: string;
  age: string;
  gender: string;
  style?: string;
}

// 猫咪信息类型
export interface CatInfo {
  id: string;
  userId?: string;
  name: string;
  imageUrl: string;
  config: CatConfig;
  createdAt: Date;
}

// 视频信息类型
export interface VideoInfo {
  id: string;
  userId?: string;
  catId: string;
  instruction: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  createdAt: Date;
}

// 应用状态类型
export interface AppState {
  user: User | null;
  currentCat: CatInfo | null;
  isLoading: boolean;
  error: string | null;
}

// API响应类型
export interface TongyiImageResponse {
  output: {
    images: Array<{
      url: string;
    }>;
  };
  usage: {
    total_tokens: number;
  };
}

export interface TongyiVideoResponse {
  output: {
    videos: Array<{
      url: string;
    }>;
  };
  usage: {
    total_tokens: number;
  };
}

// 猫咪品种选项
export const CAT_BREEDS = [
  { value: 'british-shorthair', label: '英短', emoji: '🐱' },
  { value: 'american-shorthair', label: '美短', emoji: '🐈' },
  { value: 'persian', label: '波斯猫', emoji: '🐈‍⬛' },
  { value: 'siamese', label: '暹罗猫', emoji: '🐱' },
  { value: 'maine-coon', label: '缅因猫', emoji: '🐈' },
  { value: 'ragdoll', label: '布偶猫', emoji: '🐱' },
] as const;

// 年龄选项
export const CAT_AGES = [
  { value: 'kitten', label: '幼猫', emoji: '🐱' },
  { value: 'adult', label: '成年猫', emoji: '🐈' },
  { value: 'senior', label: '老年猫', emoji: '🐈‍⬛' },
] as const;

// 性别选项
export const CAT_GENDERS = [
  { value: 'male', label: '公猫', emoji: '🐱' },
  { value: 'female', label: '母猫', emoji: '🐈' },
] as const; 