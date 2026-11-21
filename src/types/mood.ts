export type MoodType = '开心' | '平静' | '低落' | '烦躁' | '疲惫' | '迷茫';

export interface MoodRecord {
  id: number;
  createTimestamp: number;
  recordDate: string; // yyyy-MM-dd
  moodType: MoodType;
  moodScore: number; // 0 = 未打分, 1~5
  content: string;
  tags: string; // comma-separated
  stickerId: string; // '' = none
  bgColorCode: string; // '' = default
  isStar: boolean;
}

export type NewMoodRecord = Omit<MoodRecord, 'id'>;

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ReminderSettings {
  enabled: boolean;
  time: string; // HH:mm
  messageIndex: number; // 0 | 1
}

export type AppTab = 'home' | 'calendar' | 'review' | 'settings';

export type ReviewPeriod = 'week' | 'month' | 'quarter';
