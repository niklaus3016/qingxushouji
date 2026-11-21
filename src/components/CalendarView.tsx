import React, { useMemo, useState } from 'react';
import { MoodRecord, MoodType } from '../types/mood';
import { MOOD_LIST } from '../constants/moodConfig';
import { MoodIcon } from './MoodVisuals';
import { RecordCard } from './RecordCard';
import {
  formatChineseDateShort,
  formatDateYMD,
  getMonthGridCells,
  parseTags,
} from '../utils/dateAndStats';
import { ChevronLeft, ChevronRight, Search, Star, X } from 'lucide-react';

interface CalendarViewProps {
  records: MoodRecord[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  onToggleStar: (record: MoodRecord) => void;
  onEditRecord: (record: MoodRecord) => void;
  onDeleteRecord: (record: MoodRecord) => void;
}

const WEEKDAY_HEADERS = ['一', '二', '三', '四', '五', '六', '日'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  records,
  selectedDate,
  onSelectDate,
  onToggleStar,
  onEditRecord,
  onDeleteRecord,
}) => {
  const initialDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth());

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [moodFilter, setMoodFilter] = useState<MoodType | 'ALL'>('ALL');
  const [tagFilter, setTagFilter] = useState<string>('ALL');
  const [starOnly, setStarOnly] = useState<boolean>(false);

  const todayStr = formatDateYMD(new Date());

  // Collect all unique tags across all records for the tag filter
  const allAvailableTags = useMemo(() => {
    const set = new Set<string>();
    for (const r of records) {
      for (const t of parseTags(r.tags)) {
        set.add(t);
      }
    }
    return Array.from(set).sort();
  }, [records]);

  const hasActiveFilters =
    searchQuery.trim() !== '' || moodFilter !== 'ALL' || tagFilter !== 'ALL' || starOnly;

  // Filtered records across entire local database when filters are active
  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return records
      .filter((r) => {
        if (starOnly && !r.isStar) return false;
        if (moodFilter !== 'ALL' && r.moodType !== moodFilter) return false;
        if (tagFilter !== 'ALL') {
          const tags = parseTags(r.tags);
          if (!tags.includes(tagFilter)) return false;
        }
        if (q) {
          const contentMatch = r.content.toLowerCase().includes(q);
          const tagMatch = r.tags.toLowerCase().includes(q);
          if (!contentMatch && !tagMatch) return false;
        }
        return true;
      })
      .sort((a, b) => b.createTimestamp - a.createTimestamp);
  }, [records, searchQuery, moodFilter, tagFilter, starOnly]);

  // Group records by dateStr for the calendar cells
  const recordsByDate = useMemo(() => {
    const map = new Map<string, MoodRecord[]>();
    for (const r of records) {
      const arr = map.get(r.recordDate) || [];
      arr.push(r);
      map.set(r.recordDate, arr);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => b.createTimestamp - a.createTimestamp);
    }
    return map;
  }, [records]);

  const monthCells = useMemo(
    () => getMonthGridCells(viewYear, viewMonth, todayStr),
    [viewYear, viewMonth, todayStr]
  );

  const selectedDayRecords = useMemo(() => {
    return recordsByDate.get(selectedDate) || [];
  }, [recordsByDate, selectedDate]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    onSelectDate(formatDateYMD(now));
  };

  const resetFilters = () => {
    setSearchQuery('');
    setMoodFilter('ALL');
    setTagFilter('ALL');
    setStarOnly(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Search & Filter Bar */}
      <section
        aria-label="手记搜索与筛选"
        className="rounded-3xl border border-[#E5E7E4] dark:border-[#2A3030] bg-white dark:bg-[#1D2121] p-4 sm:p-5 space-y-3.5"
      >
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#858F8D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索手记正文或标签关键词..."
              aria-label="关键词检索手记"
              className="w-full min-h-[44px] pl-10 pr-9 rounded-2xl border border-black/[0.08] dark:border-white/[0.09] bg-[#F7F6F2] dark:bg-[#151818] text-sm text-[#252C2B] dark:text-[#E8EEEC] placeholder:text-[#96A09E] focus:outline-none focus:ring-2 focus:ring-[#5E8C88]/60"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="清空搜索"
                className="min-w-[36px] min-h-[36px] flex items-center justify-center absolute right-1.5 top-1/2 -translate-y-1/2 text-[#858F8D] hover:text-[#252C2B] dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Tag Filter Select */}
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              aria-label="按自定义标签筛选"
              className="min-h-[44px] px-3 rounded-2xl border border-black/[0.08] dark:border-white/[0.09] bg-[#F7F6F2] dark:bg-[#151818] text-xs font-medium text-[#3D4645] dark:text-[#CBD3D1] focus:outline-none focus:ring-2 focus:ring-[#5E8C88]/60"
            >
              <option value="ALL">全部标签</option>
              {allAvailableTags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>

            {/* Star-Only Quick Toggle */}
            <button
              type="button"
              onClick={() => setStarOnly((s) => !s)}
              aria-pressed={starOnly}
              className={`min-h-[44px] px-3.5 rounded-2xl border flex items-center gap-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                starOnly
                  ? 'border-[#D59B49] bg-[#FBF3E4] text-[#8F601C] dark:bg-[#2F271B] dark:text-[#E7BC78]'
                  : 'border-black/[0.08] dark:border-white/[0.09] bg-[#F7F6F2] dark:bg-[#151818] text-[#4B5553] dark:text-[#AAB5B3]'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${starOnly ? 'fill-[#D59B49]' : ''}`} />
              <span>只看收藏</span>
            </button>
          </div>
        </div>

        {/* Mood Type Segmented Filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setMoodFilter('ALL')}
            className={`min-h-[40px] px-3 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
              moodFilter === 'ALL'
                ? 'bg-[#5E8C88] text-white dark:bg-[#6A9B97] dark:text-[#111515]'
                : 'bg-black/[0.03] dark:bg-white/[0.04] text-[#5B6563] dark:text-[#9CA8A6] hover:bg-black/[0.06]'
            }`}
          >
            全部情绪
          </button>
          {MOOD_LIST.map((m) => {
            const active = moodFilter === m.type;
            return (
              <button
                key={m.type}
                type="button"
                onClick={() => setMoodFilter(active ? 'ALL' : m.type)}
                className={`min-h-[40px] px-3 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors ${
                  active
                    ? `${m.softBgLight} ${m.softBgDark} ${m.textLight} ${m.textDark} ring-1 ring-current`
                    : 'bg-black/[0.03] dark:bg-white/[0.04] text-[#5B6563] dark:text-[#9CA8A6] hover:bg-black/[0.06]'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: m.color }}
                />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Content: Either Filtered Search List OR Month Calendar + Selected Day List */}
      {hasActiveFilters ? (
        <section aria-label="筛选结果列表" className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-medium text-[#5A6462] dark:text-[#9AA5A3] tabular-nums">
              共匹配 {filteredRecords.length} 条手记
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="min-h-[40px] px-3 text-xs font-medium text-[#5E8C88] dark:text-[#86B6B2] hover:underline"
            >
              重置筛选
            </button>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#DCE0DD] dark:border-[#2E3534] bg-white/50 dark:bg-[#1D2121]/50 px-5 py-12 text-center">
              <p className="text-sm text-[#6E7876] dark:text-[#8F9A98]">
                没有找到符合条件的手记
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredRecords.map((rec) => (
                <RecordCard
                  key={rec.id}
                  record={rec}
                  showDate={true}
                  onToggleStar={onToggleStar}
                  onEdit={onEditRecord}
                  onRequestDelete={onDeleteRecord}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Month Grid Calendar */}
          <section
            aria-label="月视图日历"
            className="lg:col-span-7 rounded-3xl border border-[#E5E7E4] dark:border-[#2A3030] bg-white dark:bg-[#1D2121] p-4 sm:p-5"
          >
            {/* Month Switcher */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  aria-label="上个月"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#4E5856] dark:text-[#B2BCBA] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-base font-semibold text-[#252C2B] dark:text-[#EEF2F1] tabular-nums px-1">
                  {viewYear}年{viewMonth + 1}月
                </h2>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  aria-label="下个月"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#4E5856] dark:text-[#B2BCBA] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleGoToday}
                className="min-h-[40px] px-3 rounded-xl text-xs font-medium text-[#5E8C88] dark:text-[#86B6B2] bg-[#5E8C88]/10 hover:bg-[#5E8C88]/15 transition-colors"
              >
                回到今天
              </button>
            </div>

            {/* Weekday Header */}
            <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
              {WEEKDAY_HEADERS.map((w) => (
                <span
                  key={w}
                  className="text-xs font-medium text-[#8B9593] dark:text-[#6E7876]"
                >
                  {w}
                </span>
              ))}
            </div>

            {/* Day Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {monthCells.map((cell, idx) => {
                if (!cell.dateStr || !cell.day) {
                  return <div key={`empty-${idx}`} className="min-h-[54px]" />;
                }
                const dayRecs = recordsByDate.get(cell.dateStr) || [];
                const latest = dayRecs[0];
                const isSelected = selectedDate === cell.dateStr;
                const hasRecords = dayRecs.length > 0;

                return (
                  <button
                    key={cell.dateStr}
                    type="button"
                    onClick={() => onSelectDate(cell.dateStr!)}
                    className={`min-h-[54px] rounded-2xl p-1 flex flex-col items-center justify-between transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E8C88] ${
                      isSelected
                        ? 'bg-[#5E8C88]/15 dark:bg-[#5E8C88]/25 ring-2 ring-[#5E8C88]'
                        : hasRecords
                          ? 'bg-[#F4F7F6] dark:bg-[#232928] hover:bg-[#EAEFED] dark:hover:bg-[#2A3230]'
                          : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <span
                      className={`text-[11px] leading-none tabular-nums ${
                        cell.isToday
                          ? 'font-bold text-[#5E8C88] dark:text-[#86B6B2]'
                          : hasRecords
                            ? 'font-semibold text-[#2E3635] dark:text-[#DCE3E1]'
                            : 'text-[#7B8583] dark:text-[#818D8B]'
                      }`}
                    >
                      {cell.day}
                    </span>

                    <div className="h-6 flex items-center justify-center relative">
                      {latest ? (
                        <>
                          <MoodIcon mood={latest.moodType} size={20} />
                          {dayRecs.length > 1 && (
                            <span className="ml-0.5 text-[9px] font-semibold text-[#6E7876] dark:text-[#96A2A0] tabular-nums">
                              {dayRecs.length}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="w-1 h-1 rounded-full bg-black/[0.06] dark:bg-white/[0.07]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Selected Date Records List (Reverse Chronological) */}
          <section aria-label="当日手记列表" className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-sm font-semibold text-[#252C2B] dark:text-[#EEF2F1]">
                  {formatChineseDateShort(selectedDate)}
                </h3>
                <p className="text-xs text-[#7B8583] dark:text-[#8C9795] mt-0.5">
                  当日手记 · 按时间倒序
                </p>
              </div>
              <span className="text-xs text-[#7B8583] dark:text-[#8C9795] tabular-nums">
                {selectedDayRecords.length} 条
              </span>
            </div>

            {selectedDayRecords.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#DCE0DD] dark:border-[#2E3534] bg-white/40 dark:bg-[#1D2121]/40 px-5 py-10 text-center">
                <p className="text-xs text-[#828C8A] dark:text-[#768280]">
                  这一天没有留下记录
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayRecords.map((rec) => (
                  <RecordCard
                    key={rec.id}
                    record={rec}
                    onToggleStar={onToggleStar}
                    onEdit={onEditRecord}
                    onRequestDelete={onDeleteRecord}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
