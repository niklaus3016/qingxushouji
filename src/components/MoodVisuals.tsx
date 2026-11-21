import React from 'react';
import { MoodType } from '../types/mood';
import { MOOD_MAP } from '../constants/moodConfig';

interface MoodIconProps {
  mood: MoodType;
  size?: number;
  className?: string;
}

/**
 * Custom offline SVG mood emblems — calm, soft-stroke, harmonious in light and dark modes.
 */
export const MoodIcon: React.FC<MoodIconProps> = ({ mood, size = 24, className = '' }) => {
  const color = MOOD_MAP[mood]?.color || '#5E8C88';

  switch (mood) {
    case '开心':
      return (
        <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
          <circle cx="14" cy="14" r="11" fill={color} fillOpacity="0.16" stroke={color} strokeWidth="1.6" />
          <path d="M9.5 11.8C9.8 10.7 10.9 10.7 11.2 11.8" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
          <path d="M16.8 11.8C17.1 10.7 18.2 10.7 18.5 11.8" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
          <path d="M10 15.8C11 18.1 17 18.1 18 15.8" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case '平静':
      return (
        <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
          <circle cx="14" cy="14" r="11" fill={color} fillOpacity="0.16" stroke={color} strokeWidth="1.6" />
          <path d="M9.5 12.2C10.2 12.8 11.1 12.8 11.8 12.2" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M16.2 12.2C16.9 12.8 17.8 12.8 18.5 12.2" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M11 16.5C12.5 17.3 15.5 17.3 17 16.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case '低落':
      return (
        <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
          <circle cx="14" cy="14" r="11" fill={color} fillOpacity="0.16" stroke={color} strokeWidth="1.6" />
          <circle cx="10.5" cy="12.2" r="1" fill={color} />
          <circle cx="17.5" cy="12.2" r="1" fill={color} />
          <path d="M10.5 17.6C11.8 15.9 16.2 15.9 17.5 17.6" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case '烦躁':
      return (
        <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
          <circle cx="14" cy="14" r="11" fill={color} fillOpacity="0.16" stroke={color} strokeWidth="1.6" />
          <path d="M9.2 10.6L11.8 11.8" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M18.8 10.6L16.2 11.8" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="10.5" cy="13.2" r="0.9" fill={color} />
          <circle cx="17.5" cy="13.2" r="0.9" fill={color} />
          <path d="M10.5 17.4L12.3 16.2L14 17.4L15.7 16.2L17.5 17.4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case '疲惫':
      return (
        <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
          <circle cx="14" cy="14" r="11" fill={color} fillOpacity="0.16" stroke={color} strokeWidth="1.6" />
          <path d="M9.3 12.2H11.9" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M16.1 12.2H18.7" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
          <ellipse cx="14" cy="16.8" rx="2.1" ry="1.5" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case '迷茫':
      return (
        <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
          <circle cx="14" cy="14" r="11" fill={color} fillOpacity="0.16" stroke={color} strokeWidth="1.6" />
          <circle cx="10.4" cy="12.2" r="1" fill={color} />
          <circle cx="17.6" cy="11.6" r="1" fill={color} />
          <path d="M10.8 16.8C12.2 16.2 14.5 17.4 17.2 16.3" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
  }
};

export interface StickerDef {
  id: string;
  label: string;
  render: (size?: number) => React.ReactNode;
}

/**
 * Built-in static healing SVG stickers (zero external assets).
 */
export const STICKERS: StickerDef[] = [
  {
    id: 'cloud',
    label: '软云',
    render: (size = 24) => (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M9.5 22.5H22.5C25 22.5 27 20.6 27 18.2C27 16 25.3 14.2 23.1 14C22.4 10.6 19.4 8 15.8 8C12 8 8.9 10.8 8.5 14.5C6.5 15 5 16.8 5 18.9C5 20.9 7 22.5 9.5 22.5Z"
          fill="#DCEAE8"
          stroke="#5E8C88"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'tea',
    label: '热茶',
    render: (size = 24) => (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M8 14H21V19.5C21 22.5 18.5 25 15.5 25H13.5C10.5 25 8 22.5 8 19.5V14Z" fill="#EFE6D5" stroke="#8C7352" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M21 15.5H23C24.4 15.5 25.5 16.6 25.5 18C25.5 19.4 24.4 20.5 23 20.5H21" stroke="#8C7352" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 10.5C12 9.2 13 8.5 13 7.2" stroke="#8C7352" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M16.5 10.5C16.5 9.2 17.5 8.5 17.5 7.2" stroke="#8C7352" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'sprout',
    label: '新芽',
    render: (size = 24) => (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M16 26V15" stroke="#5E8C70" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M16 17C16 12 20.5 9 25 9.5C25 14.5 21 18 16 17Z" fill="#DCEBD9" stroke="#5E8C70" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M16 19C16 14.5 11.5 11.5 7 12C7 17 11 20 16 19Z" fill="#E6F0E3" stroke="#5E8C70" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'moon',
    label: '月牙',
    render: (size = 24) => (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M21.8 19.8C17.4 19.8 13.8 16.2 13.8 11.8C13.8 9.9 14.5 8.1 15.6 6.8C10.9 7.4 7.2 11.4 7.2 16.3C7.2 21.6 11.5 25.8 16.8 25.8C20.9 25.8 24.4 23.2 25.8 19.5C24.6 19.7 23.2 19.8 21.8 19.8Z"
          fill="#F6EBD2"
          stroke="#B58E43"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'star',
    label: '微星',
    render: (size = 24) => (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M16 6L18.5 13.5L26 16L18.5 18.5L16 26L13.5 18.5L6 16L13.5 13.5L16 6Z"
          fill="#F8E9CE"
          stroke="#C29142"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'leaf',
    label: '落叶',
    render: (size = 24) => (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M24 8C15 8 9 13.5 9 22C17.5 22 24 16.5 24 8Z"
          fill="#F2E2D4"
          stroke="#B37954"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M7 25L18 14" stroke="#B37954" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'umbrella',
    label: '晴伞',
    render: (size = 24) => (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M6 16.5C6 11 10.5 7 16 7C21.5 7 26 11 26 16.5H6Z"
          fill="#DCE6F0"
          stroke="#5B7896"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M16 16.5V23C16 24.4 17.1 25.5 18.5 25.5C19.6 25.5 20.5 24.6 20.5 23.5" stroke="#5B7896" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'plane',
    label: '纸鹤',
    render: (size = 24) => (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M26 7L6 15.2L14 18.2L22.5 10.5L16.5 19.5L20 25L26 7Z"
          fill="#E5ECEB"
          stroke="#5E8C88"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export const STICKER_MAP: Record<string, StickerDef> = STICKERS.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<string, StickerDef>
);
