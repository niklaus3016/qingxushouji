import React, { useMemo } from 'react';
import { MoodRecord, NewMoodRecord } from '../types/mood';
import { MOOD_LIST, MOOD_MAP } from '../constants/moodConfig';
import { TodayRecordForm } from './TodayRecordForm';
import { RecordCard } from './RecordCard';
import {
  computeMonthSummaryText,
  formatDateYMD,
  getMonthGridCells,
} from '../utils/dateAndStats';
import { ChevronRight } from 'lucide-react';

interface HomeViewProps {
  records: MoodRecord[];
  quickTags: string[];
  onAddRecord: (data: NewMoodRecord) => Promise<void>;
  onToggleStar: (record: MoodRecord) => void;
  onEditRecord: (record: MoodRecord) => void;
  onDeleteRecord: (record: MoodRecord) => void;
  onJumpToCalendarDate: (dateStr: string) => void;
}

const WEEKDAY_HEADERS = ['一', '二', '三', '四', '五', '六', '日'];

export const HomeView: React.FC<HomeViewProps> = ({
  records,
  quickTags,
  onAddRecord,
  onToggleStar,
  onEditRecord,
  onDeleteRecord,
  onJumpToCalendarDate,
}) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayStr = formatDateYMD(now);

  const todayRecords = useMemo(
    () =>
      records
        .filter((r) => r.recordDate === todayStr)
        .sort((a, b) => b.createTimestamp - a.createTimestamp),
    [records, todayStr]
  );

  // Map dateStr -> latest record on that day for dot color
  const dayLatestRecordMap = useMemo(() => {
    const map = new Map<string, MoodRecord>();
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    for (const r of records) {
      if (!r.recordDate.startsWith(prefix)) continue;
      const existing = map.get(r.recordDate);
      if (!existing || r.createTimestamp > existing.createTimestamp) {
        map.set(r.recordDate, r);
      }
    }
    return map;
  }, [records, year, month]);

  const monthCells = useMemo(
    () => getMonthGridCells(year, month, todayStr),
    [year, month, todayStr]
  );

  const monthSummaryText = useMemo(
    () => computeMonthSummaryText(records, year, month),
    [records, year, month]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left / Primary Column: Today's Record Card */}
      <div className="lg:col-span-7">
        <TodayRecordForm quickTags={quickTags} onSave={(data) => onAddRecord(data)} />
      </div>

      {/* Right / Secondary Column: Monthly Dot Matrix Overview + Today's Logged Records */}
      <div className="lg:col-span-5 space-y-5">
        {/* Monthly Emotion Dot Matrix */}
        <section
          aria-label="本月情绪点阵概览"
          className="rounded-3xl border border-[#E5E7E4] dark:border-[#2A3030] bg-white dark:bg-[#1D2121] p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold text-[#252C2B] dark:text-[#EEF2F1]">
                本月情绪点阵
              </h2>
              <p className="text-xs text-[#788280] dark:text-[#8F9A98] tabular-nums mt-0.5">
                {year}年{month + 1}月
              </p>
            </div>
            <button
              type="button"
              onClick={() => onJumpToCalendarDate(todayStr)}
              className="min-h-[44px] px-2.5 flex items-center gap-1 text-xs font-medium text-[#5E8C88] dark:text-[#86B6B2] hover:underline whitespace-nowrap"
            >
              <span>日历详情</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1.5 text-center mb-1.5">
            {WEEKDAY_HEADERS.map((w) => (
              <span
                key={w}
                className="text-[11px] font-medium text-[#8C9694] dark:text-[#6E7876]"
              >
                {w}
              </span>
            ))}
          </div>

          {/* Dot Matrix Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {monthCells.map((cell, idx) => {
              if (!cell.dateStr || !cell.day) {
                return <div key={`empty-${idx}`} className="h-9" />;
              }
              const latest = dayLatestRecordMap.get(cell.dateStr);
              const moodColor = latest ? MOOD_MAP[latest.moodType].color : null;

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => onJumpToCalendarDate(cell.dateStr!)}
                  title={
                    latest
                      ? `${cell.dateStr} · ${latest.moodType}`
                      : `${cell.dateStr} · 暂无记录`
                  }
                  className={`h-9 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E8C88] ${
                    cell.isToday
                      ? 'bg-[#5E8C88]/10 dark:bg-[#5E8C88]/20 font-semibold text-[#3B6460] dark:text-[#A4CECA]'
                      : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04] text-[#5C6664] dark:text-[#96A2A0]'
                  }`}
                >
                  <span className="text-[10px] leading-none tabular-nums">{cell.day}</span>
                  <span
                    className={`w-2.5 h-2.5 rounded-full transition-transform ${
                      moodColor ? '' : 'border border-dashed border-[#D3D8D6] dark:border-[#39403F]'
                    }`}
                    style={moodColor ? { backgroundColor: moodColor } : undefined}
                  />
                </button>
              );
            })}
          </div>

          {/* Color Legend (unboxed inline) */}
          <div className="mt-4 pt-3 border-t border-black/[0.05] dark:border-white/[0.06] flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {MOOD_LIST.map((m) => (
              <span
                key={m.type}
                className="inline-flex items-center gap-1.5 text-[11px] text-[#697472] dark:text-[#939E9C]"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: m.color }}
                />
                <span>{m.label}</span>
              </span>
            ))}
          </div>

          {/* Local Fixed-Template Monthly Summary */}
          <p className="mt-3 pt-3 border-t border-black/[0.05] dark:border-white/[0.06] text-xs leading-relaxed text-[#4E5856] dark:text-[#B4BFBD]">
            {monthSummaryText}
          </p>
        </section>

        {/* Today's Logged Records */}
        <section aria-label="今日已记手记" className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold text-[#323A39] dark:text-[#DCE3E1]">
              今日手记
            </h3>
            <span className="text-xs text-[#7B8583] dark:text-[#8C9795] tabular-nums">
              {todayRecords.length} 条
            </span>
          </div>

          {todayRecords.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#DCE0DD] dark:border-[#2E3534] px-4 py-6 text-center text-xs text-[#828C8A] dark:text-[#768280]">
              今天还没有记录，随时写下一句或只点选情绪保存即可
            </div>
          ) : (
            <div className="space-y-3">
              {todayRecords.map((rec) => (
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
    </div>
  );
};
