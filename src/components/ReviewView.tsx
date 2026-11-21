import React, { useMemo, useState } from 'react';
import { MoodRecord, ReviewPeriod } from '../types/mood';
import { computePeriodStats } from '../utils/dateAndStats';
import { MoodIcon } from './MoodVisuals';
import { RefreshCw } from 'lucide-react';

interface ReviewViewProps {
  records: MoodRecord[];
}

const PERIOD_OPTIONS: { value: ReviewPeriod; label: string }[] = [
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
  { value: 'quarter', label: '近90天' },
];

export const ReviewView: React.FC<ReviewViewProps> = ({ records }) => {
  const [period, setPeriod] = useState<ReviewPeriod>('week');
  const [reflectionIdx, setReflectionIdx] = useState<number>(0);
  const [activeSliceType, setActiveSliceType] = useState<string | null>(null);
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);

  const stats = useMemo(() => computePeriodStats(records, period), [records, period]);

  const currentReflection =
    stats.reflections[reflectionIdx % Math.max(1, stats.reflections.length)] || '';

  // Donut Chart Geometry (SVG circumference = 2 * PI * r)
  const radius = 56;
  const circumference = 2 * Math.PI * radius;

  const donutSegments = useMemo(() => {
    let accumulated = 0;
    return stats.slices.map((slice) => {
      const fraction = stats.totalCount > 0 ? slice.count / stats.totalCount : 0;
      const dashLength = fraction * circumference;
      const offset = -accumulated * circumference;
      accumulated += fraction;
      return {
        ...slice,
        dashLength,
        offset,
      };
    });
  }, [stats.slices, stats.totalCount, circumference]);

  // Line Chart Geometry
  const chartW = 560;
  const chartH = 200;
  const padL = 32;
  const padR = 18;
  const padT = 18;
  const padB = 32;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const scoredPoints = useMemo(() => {
    const total = stats.linePoints.length;
    if (total === 0) return [];
    return stats.linePoints
      .map((pt, index) => {
        const x = total === 1 ? padL + plotW / 2 : padL + (index / (total - 1)) * plotW;
        const y =
          pt.avgScore !== null
            ? padT + ((5 - pt.avgScore) / 4) * plotH
            : null;
        return {
          ...pt,
          index,
          x,
          y,
        };
      })
      .filter((p): p is typeof p & { y: number } => p.y !== null);
  }, [stats.linePoints, plotW, plotH]);

  const linePathD = useMemo(() => {
    if (scoredPoints.length === 0) return '';
    return scoredPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ');
  }, [scoredPoints]);

  const xAxisTicks = useMemo(() => {
    const pts = stats.linePoints;
    if (pts.length <= 1) return pts.map((p, idx) => ({ label: p.shortLabel, idx }));
    const indices = [0, Math.floor((pts.length - 1) / 2), pts.length - 1];
    const unique = Array.from(new Set(indices));
    return unique.map((idx) => ({ label: pts[idx].shortLabel, idx }));
  }, [stats.linePoints]);

  const inspectedPoint =
    hoveredPointIdx !== null
      ? scoredPoints.find((p) => p.index === hoveredPointIdx)
      : scoredPoints[scoredPoints.length - 1];

  return (
    <div className="space-y-5">
      {/* Period Selector */}
      <div className="flex items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="统计周期"
          className="inline-flex items-center p-1 rounded-2xl bg-[#EAECE9] dark:bg-[#222726]"
        >
          {PERIOD_OPTIONS.map((opt) => {
            const active = period === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setPeriod(opt.value);
                  setReflectionIdx(0);
                  setActiveSliceType(null);
                  setHoveredPointIdx(null);
                }}
                className={`min-h-[40px] px-4 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  active
                    ? 'bg-white dark:bg-[#171B1B] text-[#252C2B] dark:text-[#EEF2F1] shadow-xs'
                    : 'text-[#626C6A] dark:text-[#96A2A0] hover:text-[#252C2B] dark:hover:text-[#DCE3E1]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <span className="text-xs text-[#7D8785] dark:text-[#889492]">
          纯本地统计 · 无上传
        </span>
      </div>

      {/* 4 Summary Metrics Grid */}
      <section aria-label="周期概览数据" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-[#E5E7E4] dark:border-[#2A3030] bg-white dark:bg-[#1D2121] p-4">
          <div className="text-xs text-[#727C7A] dark:text-[#939E9C]">总记录条数</div>
          <div className="mt-1.5 text-2xl font-semibold text-[#252C2B] dark:text-[#EEF2F1] tabular-nums">
            {stats.totalCount}
            <span className="ml-1 text-xs font-normal text-[#7D8785]">条</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E5E7E4] dark:border-[#2A3030] bg-white dark:bg-[#1D2121] p-4">
          <div className="text-xs text-[#727C7A] dark:text-[#939E9C]">连续记录天数</div>
          <div className="mt-1.5 text-2xl font-semibold text-[#252C2B] dark:text-[#EEF2F1] tabular-nums">
            {stats.streakDays}
            <span className="ml-1 text-xs font-normal text-[#7D8785]">天</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E5E7E4] dark:border-[#2A3030] bg-white dark:bg-[#1D2121] p-4">
          <div className="text-xs text-[#727C7A] dark:text-[#939E9C]">最常出现情绪</div>
          <div className="mt-1.5 flex items-center gap-2 min-h-[32px]">
            {stats.topMood ? (
              <>
                <MoodIcon mood={stats.topMood} size={24} />
                <span className="text-lg font-semibold text-[#252C2B] dark:text-[#EEF2F1]">
                  {stats.topMood}
                </span>
                <span className="text-xs text-[#7D8785] tabular-nums">
                  {stats.topMoodCount}次
                </span>
              </>
            ) : (
              <span className="text-lg font-semibold text-[#9AA3A1]">--</span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[#E5E7E4] dark:border-[#2A3030] bg-white dark:bg-[#1D2121] p-4">
          <div className="text-xs text-[#727C7A] dark:text-[#939E9C]">情绪平均分</div>
          <div className="mt-1.5 text-2xl font-semibold text-[#252C2B] dark:text-[#EEF2F1] tabular-nums">
            {stats.avgScore !== null ? stats.avgScore.toFixed(1) : '--'}
            {stats.avgScore !== null && (
              <span className="ml-1 text-xs font-normal text-[#7D8785]">/ 5</span>
            )}
          </div>
        </div>
      </section>

      {/* Fixed Template Local Reflection Sentence */}
      <section
        aria-label="复盘短句"
        className="rounded-3xl border border-[#DCE6E4] dark:border-[#293534] bg-[#EFF5F4] dark:bg-[#192423] p-5 flex items-start justify-between gap-4"
      >
        <div>
          <p className="text-xs font-medium text-[#4F7874] dark:text-[#86B6B2]">
            本地情绪小记
          </p>
          <p className="mt-1.5 text-sm sm:text-base leading-relaxed text-[#253331] dark:text-[#DCE8E6]">
            {currentReflection}
          </p>
        </div>

        {stats.reflections.length > 1 && (
          <button
            type="button"
            onClick={() => setReflectionIdx((i) => i + 1)}
            aria-label="换一句复盘短句"
            className="min-w-[44px] min-h-[44px] shrink-0 flex items-center justify-center rounded-2xl text-[#4F7874] dark:text-[#86B6B2] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </section>

      {/* Charts Row: Mood Distribution Pie/Donut + Daily Score Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Donut Chart */}
        <section
          aria-label="情绪分布饼图"
          className="rounded-3xl border border-[#E5E7E4] dark:border-[#2A3030] bg-white dark:bg-[#1D2121] p-5"
        >
          <div className="mb-4">
            <h3 className="text-base font-semibold text-[#252C2B] dark:text-[#EEF2F1]">
              情绪分布占比
            </h3>
            <p className="text-xs text-[#7B8583] dark:text-[#8C9795] mt-0.5">
              点击图例或色块查看各情绪次数与占比
            </p>
          </div>

          {stats.totalCount === 0 ? (
            <div className="h-52 flex items-center justify-center text-xs text-[#8A9492]">
              当前周期暂无情绪分布数据
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-40 h-40 shrink-0">
                <svg viewBox="0 0 150 150" className="w-full h-full -rotate-90">
                  <circle
                    cx="75"
                    cy="75"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    className="text-black/[0.04] dark:text-white/[0.06]"
                    strokeWidth="18"
                  />
                  {donutSegments.map((seg) => {
                    const isActive = activeSliceType === seg.type;
                    return (
                      <circle
                        key={seg.type}
                        cx="75"
                        cy="75"
                        r={radius}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth={isActive ? 22 : 18}
                        strokeDasharray={`${seg.dashLength} ${circumference}`}
                        strokeDashoffset={seg.offset}
                        className="cursor-pointer transition-all duration-150"
                        onClick={() =>
                          setActiveSliceType(isActive ? null : seg.type)
                        }
                      />
                    );
                  })}
                </svg>

                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  {activeSliceType ? (
                    <>
                      <span className="text-sm font-semibold text-[#252C2B] dark:text-[#EEF2F1]">
                        {activeSliceType}
                      </span>
                      <span className="text-xs text-[#6E7876] dark:text-[#96A2A0] tabular-nums">
                        {stats.slices.find((s) => s.type === activeSliceType)?.percentage}%
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl font-semibold text-[#252C2B] dark:text-[#EEF2F1] tabular-nums">
                        {stats.totalCount}
                      </span>
                      <span className="text-[11px] text-[#7B8583] dark:text-[#8C9795]">
                        总记录
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Legend */}
              <div className="flex-1 w-full space-y-2">
                {stats.slices.map((slice) => {
                  const isActive = activeSliceType === slice.type;
                  return (
                    <button
                      key={slice.type}
                      type="button"
                      onClick={() =>
                        setActiveSliceType(isActive ? null : slice.type)
                      }
                      className={`w-full min-h-[38px] px-2.5 py-1.5 rounded-xl flex items-center justify-between text-xs transition-colors ${
                        isActive
                          ? 'bg-black/[0.05] dark:bg-white/[0.08]'
                          : 'hover:bg-black/[0.025] dark:hover:bg-white/[0.04]'
                      }`}
                    >
                      <span className="flex items-center gap-2 font-medium text-[#2F3736] dark:text-[#DDE4E2]">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: slice.color }}
                        />
                        <span>{slice.type}</span>
                      </span>
                      <span className="text-[#6E7876] dark:text-[#96A2A0] tabular-nums">
                        {slice.count} 次 · {slice.percentage}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Daily Score Line Chart */}
        <section
          aria-label="情绪分数折线图"
          className="rounded-3xl border border-[#E5E7E4] dark:border-[#2A3030] bg-white dark:bg-[#1D2121] p-5"
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <h3 className="text-base font-semibold text-[#252C2B] dark:text-[#EEF2F1]">
                情绪分数走势
              </h3>
              <p className="text-xs text-[#7B8583] dark:text-[#8C9795] mt-0.5">
                每日已打分记录的均值变化（1–5分）
              </p>
            </div>
            {inspectedPoint && (
              <div className="text-right text-xs tabular-nums">
                <div className="text-[#7B8583] dark:text-[#8C9795]">
                  {inspectedPoint.shortLabel}
                </div>
                <div className="font-semibold text-[#5E8C88] dark:text-[#86B6B2]">
                  {inspectedPoint.avgScore} 分
                </div>
              </div>
            )}
          </div>

          {scoredPoints.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-xs text-[#8A9492] text-center px-4">
              当前周期还没有带分数的记录，记录时可选填 1–5 分查看情绪曲线
            </div>
          ) : (
            <div className="w-full overflow-hidden">
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="w-full h-auto"
                role="img"
                aria-label="情绪分数折线图"
              >
                {/* Horizontal grid lines for scores 1 to 5 */}
                {[1, 2, 3, 4, 5].map((scoreVal) => {
                  const y = padT + ((5 - scoreVal) / 4) * plotH;
                  return (
                    <g key={scoreVal}>
                      <line
                        x1={padL}
                        x2={chartW - padR}
                        y1={y}
                        y2={y}
                        stroke="currentColor"
                        className="text-black/[0.06] dark:text-white/[0.08]"
                        strokeDasharray="3 3"
                      />
                      <text
                        x={padL - 8}
                        y={y + 4}
                        textAnchor="end"
                        fontSize="11"
                        fill="currentColor"
                        className="text-[#8B9593] dark:text-[#768280]"
                      >
                        {scoreVal}
                      </text>
                    </g>
                  );
                })}

                {/* Connecting line */}
                {scoredPoints.length > 1 && (
                  <path
                    d={linePathD}
                    fill="none"
                    stroke="#5E8C88"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Data points */}
                {scoredPoints.map((pt) => {
                  const isFocused = inspectedPoint?.index === pt.index;
                  return (
                    <g
                      key={pt.dateStr}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPointIdx(pt.index)}
                      onClick={() => setHoveredPointIdx(pt.index)}
                    >
                      <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isFocused ? 5.5 : 4}
                        fill="#5E8C88"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />
                    </g>
                  );
                })}

                {/* X-Axis Labels */}
                {xAxisTicks.map((tick) => {
                  const total = stats.linePoints.length;
                  const x =
                    total === 1
                      ? padL + plotW / 2
                      : padL + (tick.idx / (total - 1)) * plotW;
                  return (
                    <text
                      key={tick.idx}
                      x={x}
                      y={chartH - 8}
                      textAnchor="middle"
                      fontSize="11"
                      fill="currentColor"
                      className="text-[#8B9593] dark:text-[#768280]"
                    >
                      {tick.label}
                    </text>
                  );
                })}
              </svg>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
