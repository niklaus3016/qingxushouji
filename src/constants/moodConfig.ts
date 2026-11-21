import { MoodType } from '../types/mood';

export interface MoodMeta {
  type: MoodType;
  label: string;
  shortDesc: string;
  color: string; // Primary low-saturation color for dots & charts
  softBgLight: string;
  softBgDark: string;
  textLight: string;
  textDark: string;
}

export const MOOD_LIST: MoodMeta[] = [
  {
    type: '开心',
    label: '开心',
    shortDesc: '明朗轻快',
    color: '#D59B49',
    softBgLight: 'bg-[#FBF3E4]',
    softBgDark: 'dark:bg-[#2F271B]',
    textLight: 'text-[#8F601C]',
    textDark: 'dark:text-[#E7BC78]',
  },
  {
    type: '平静',
    label: '平静',
    shortDesc: '安稳自在',
    color: '#5E8C88',
    softBgLight: 'bg-[#E9F2F0]',
    softBgDark: 'dark:bg-[#1C2A29]',
    textLight: 'text-[#39625E]',
    textDark: 'dark:text-[#8FBDB9]',
  },
  {
    type: '低落',
    label: '低落',
    shortDesc: '有些沉闷',
    color: '#6E89A6',
    softBgLight: 'bg-[#ECF1F6]',
    softBgDark: 'dark:bg-[#1E2630]',
    textLight: 'text-[#445C77]',
    textDark: 'dark:text-[#98B4D1]',
  },
  {
    type: '烦躁',
    label: '烦躁',
    shortDesc: '心绪不宁',
    color: '#C2786E',
    softBgLight: 'bg-[#F8ECEA]',
    softBgDark: 'dark:bg-[#2F201E]',
    textLight: 'text-[#8C483F]',
    textDark: 'dark:text-[#DF9D94]',
  },
  {
    type: '疲惫',
    label: '疲惫',
    shortDesc: '能量耗尽',
    color: '#8E849C',
    softBgLight: 'bg-[#F1EFF5]',
    softBgDark: 'dark:bg-[#25222B]',
    textLight: 'text-[#5C536B]',
    textDark: 'dark:text-[#B5ACC4]',
  },
  {
    type: '迷茫',
    label: '迷茫',
    shortDesc: '思绪飘忽',
    color: '#7D8B82',
    softBgLight: 'bg-[#EEF2EF]',
    softBgDark: 'dark:bg-[#202522]',
    textLight: 'text-[#4D5B52]',
    textDark: 'dark:text-[#A4B3A9]',
  },
];

export const MOOD_MAP: Record<MoodType, MoodMeta> = MOOD_LIST.reduce(
  (acc, item) => {
    acc[item.type] = item;
    return acc;
  },
  {} as Record<MoodType, MoodMeta>
);

export interface BgColorPreset {
  code: string;
  label: string;
  swatchHex: string;
  cardClass: string;
}

export const BG_COLOR_PRESETS: BgColorPreset[] = [
  {
    code: '',
    label: '素纸',
    swatchHex: '#FFFFFF',
    cardClass: 'bg-white dark:bg-[#1D2121]',
  },
  {
    code: 'cream',
    label: '暖米',
    swatchHex: '#F9F4E8',
    cardClass: 'bg-[#FAF6EC] dark:bg-[#25231D]',
  },
  {
    code: 'cyan',
    label: '淡青',
    swatchHex: '#EBF4F2',
    cardClass: 'bg-[#EDF5F3] dark:bg-[#1A2625]',
  },
  {
    code: 'blush',
    label: '浅粉',
    swatchHex: '#F8EEED',
    cardClass: 'bg-[#FAF0EF] dark:bg-[#281F20]',
  },
  {
    code: 'mist',
    label: '晴蓝',
    swatchHex: '#ECF2F7',
    cardClass: 'bg-[#EEF3F8] dark:bg-[#1C232B]',
  },
  {
    code: 'sage',
    label: '芽绿',
    swatchHex: '#EEF3EC',
    cardClass: 'bg-[#EFF4ED] dark:bg-[#1E251E]',
  },
];

export const BG_COLOR_MAP: Record<string, BgColorPreset> = BG_COLOR_PRESETS.reduce(
  (acc, item) => {
    acc[item.code] = item;
    return acc;
  },
  {} as Record<string, BgColorPreset>
);

export const REMINDER_MESSAGES = [
  '来记下今天的心情吧',
  '别忘记和自己的情绪打个招呼',
];

export const SCORE_LABELS: Record<number, string> = {
  1: '很差',
  2: '偏低',
  3: '一般',
  4: '较好',
  5: '很好',
};

export const DEFAULT_QUICK_TAGS = ['独处', '工作', '睡眠', '散步', '阅读', '朋友'];

export const APP_PACKAGE_NAME = 'com.qxsj.app';
