export type Feature = 'caption' | 'hook' | 'repurpose' | 'thread';

export type CaptionStyle = 'Aggressive' | 'Ragebait' | 'Emotional' | 'Funny' | 'Normal';

export type Platform = 'Instagram' | 'Twitter' | 'LinkedIn';

export type OutputFormat = 'Instagram caption' | 'Twitter thread' | 'LinkedIn post' | 'Carousel script';

export type ThreadType = 'Twitter thread' | 'Instagram carousel';

export type Niche = 'fitness' | 'food' | 'travel' | 'startup' | 'fashion' | 'other';

export interface UserProfile {
  name: string;
  niche: Niche;
  tonePreference: string;
}

export interface GenerateRequest {
  feature: Feature;
  prompt: string;
  style?: CaptionStyle;
  wordLimit?: number;
  hinglish?: boolean;
  abVariant?: boolean;
  platform?: Platform;
  niche?: Niche;
  imageBase64?: string;
  topic?: string;
  outputFormat?: OutputFormat;
  threadType?: ThreadType;
}

export interface GenerateResponse {
  success: boolean;
  content: string | string[];
  engagementScore?: number;
  error?: string;
}

export interface GenerateApiRequest {
  feature: Feature;
  prompt: string;
  style?: CaptionStyle;
  wordLimit?: number;
  hinglish?: boolean;
  abVariant?: boolean;
  imageBase64?: string;
  platform?: Platform;
  niche?: Niche;
  topic?: string;
  outputFormat?: OutputFormat;
  threadType?: ThreadType;
  userProfile?: UserProfile;
}
