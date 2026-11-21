import { MoodRecord, MoodType, ReviewPeriod } from '../types/mood';
import { MOOD_LIST } from '../constants/moodConfig';

const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

export function formatDateYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatChineseDateFull(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const w = WEEKDAYS[date.getDay()];
  return `${y}年${m}月${d}日 · ${w}`;
}

export function formatChineseDateShort(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  if (!y || !m || !d) return ymd;
  const dateObj = new Date(y, m - 1, d);
  return `${m}月${d}日 · ${WEEKDAYS[dateObj.getDay()]}`;
}

export function formatTimeHM(timestamp: number): string {
  const d = new Date(timestamp);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function parseTags(tagsStr: string): string[] {
  if (!tagsStr) return [];
  return tagsStr
    .split(/[，,]/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

export function normalizeTagsInput(tagsStr: string): string {
  const unique: string[] = [];
  for (const tag of parseTags(tagsStr)) {
    if (!unique.includes(tag)) unique.push(tag);
  }
  return unique.join('，');
}

export interface MonthCell {
  dateStr: string | null; // null for leading empty cells
  day: number | null;
  isToday: boolean;
}

/**
 * Returns a Monday-first calendar grid for a given year and 0-indexed month.
 */
export function getMonthGridCells(year: number, month: number, todayStr: string): MonthCell[] {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Convert Sunday(0)..Saturday(6) to Monday(0)..Sunday(6)
  const startOffset = (firstDay.getDay() + 6) % 7;

  const cells: MonthCell[] = [];
  for (let i = 0; i < startOffset; i++) {
    cells.push({ dateStr: null, day: null, isToday: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({
      dateStr,
      day,
      isToday: dateStr === todayStr,
    });
  }
  return cells;
}

/**
 * Computes a calm, fixed-template local summary sentence for the current month on Home.
 */
export function computeMonthSummaryText(records: MoodRecord[], year: number, month: number): string {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthRecords = records.filter((r) => r.recordDate.startsWith(prefix));

  if (monthRecords.length === 0) {
    return '本月还未留下情绪印记，选一个当下的感受开始记录吧。';
  }

  const counts = new Map<MoodType, number>();
  for (const m of MOOD_LIST) counts.set(m.type, 0);
  for (const r of monthRecords) {
    counts.set(r.moodType, (counts.get(r.moodType) || 0) + 1);
  }

  let topMood: MoodType = monthRecords[0].moodType;
  let topCount = 0;
  for (const [mood, count] of counts.entries()) {
    if (count > topCount) {
      topCount = count;
      topMood = mood;
    }
  }

  // Check early/mid/late month score fluctuation if enough scored entries exist
  const scored = monthRecords.filter((r) => r.moodScore > 0);
  if (scored.length >= 4) {
    const bucketScores: Record<'上旬' | '中旬' | '下旬', number[]> = {
      上旬: [],
      中旬: [],
      下旬: [],
    };
    for (const r of scored) {
      const day = Number(r.recordDate.slice(8, 10));
      if (day <= 10) bucketScores['上旬'].push(r.moodScore);
      else if (day <= 20) bucketScores['中旬'].push(r.moodScore);
      else bucketScores['下旬'].push(r.moodScore);
    }

    let maxSwingPeriod: '上旬' | '中旬' | '下旬' | null = null;
    let maxSwing = 0;
    (['上旬', '中旬', '下旬'] as const).forEach((p) => {
      const arr = bucketScores[p];
      if (arr.length >= 2) {
        const swing = Math.max(...arr) - Math.min(...arr);
        if (swing > maxSwing) {
          maxSwing = swing;
          maxSwingPeriod = p;
        }
      }
    });

    if (maxSwingPeriod && maxSwing >= 2) {
      return `本月${topMood}居多，${maxSwingPeriod}情绪波动较大。`;
    }
  }

  const uniqueDays = new Set(monthRecords.map((r) => r.recordDate)).size;
  return `本月${topMood}居多，已在 ${uniqueDays} 天里记下 ${monthRecords.length} 次心绪。`;
}

export interface MoodSlice {
  type: MoodType;
  count: number;
  percentage: number;
  color: string;
}

export interface DailyScorePoint {
  dateStr: string;
  shortLabel: string;
  avgScore: number | null;
  count: number;
}

export interface PeriodStats {
  totalCount: number;
  streakDays: number;
  topMood: MoodType | null;
  topMoodCount: number;
  avgScore: number | null;
  slices: MoodSlice[];
  linePoints: DailyScorePoint[];
  reflections: string[];
}

function getDateDaysAgo(baseDate: Date, daysAgo: number): Date {
  const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  d.setDate(d.getDate() - daysAgo);
  return d;
}

export function calculateStreakDays(allRecords: MoodRecord[], today: Date): number {
  if (allRecords.length === 0) return 0;
  const dateSet = new Set(allRecords.map((r) => r.recordDate));
  const todayStr = formatDateYMD(today);
  const yesterdayStr = formatDateYMD(getDateDaysAgo(today, 1));

  // If neither today nor yesterday has a record, current streak is 0
  let cursor: Date;
  if (dateSet.has(todayStr)) {
    cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  } else if (dateSet.has(yesterdayStr)) {
    cursor = getDateDaysAgo(today, 1);
  } else {
    return 0;
  }

  let streak = 0;
  while (dateSet.has(formatDateYMD(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function computePeriodStats(
  allRecords: MoodRecord[],
  period: ReviewPeriod,
  now: Date = new Date()
): PeriodStats {
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let startDate: Date;
  let dayCount: number;

  if (period === 'week') {
    // Natural week: Monday through today, matching the "本周" label.
    const daysSinceMonday = (todayMidnight.getDay() + 6) % 7;
    startDate = getDateDaysAgo(todayMidnight, daysSinceMonday);
    dayCount = daysSinceMonday + 1;
  } else if (period === 'month') {
    startDate = new Date(todayMidnight.getFullYear(), todayMidnight.getMonth(), 1);
    dayCount = todayMidnight.getDate();
  } else {
    startDate = getDateDaysAgo(todayMidnight, 89);
    dayCount = 90;
  }

  const startStr = formatDateYMD(startDate);
  const endStr = formatDateYMD(todayMidnight);

  const periodRecords = allRecords.filter(
    (r) => r.recordDate >= startStr && r.recordDate <= endStr
  );

  const totalCount = periodRecords.length;
  const streakDays = calculateStreakDays(allRecords, now);

  // Mood distribution
  const counts = new Map<MoodType, number>();
  for (const m of MOOD_LIST) counts.set(m.type, 0);
  for (const r of periodRecords) {
    counts.set(r.moodType, (counts.get(r.moodType) || 0) + 1);
  }

  let topMood: MoodType | null = null;
  let topMoodCount = 0;
  for (const [m, c] of counts.entries()) {
    if (c > topMoodCount) {
      topMoodCount = c;
      topMood = m;
    }
  }

  const presentMoods = MOOD_LIST.map((m) => ({
    type: m.type,
    count: counts.get(m.type) || 0,
    color: m.color,
  })).filter((s) => s.count > 0);

  // Largest-remainder rounding keeps the displayed percentages summing to exactly 100.
  const percentages = presentMoods.map(() => 0);
  if (totalCount > 0) {
    const exact = presentMoods.map((s) => (s.count / totalCount) * 100);
    let assigned = 0;
    exact.forEach((value, i) => {
      percentages[i] = Math.floor(value);
      assigned += percentages[i];
    });
    const byRemainder = exact
      .map((value, i) => ({ i, remainder: value - Math.floor(value) }))
      .sort((a, b) => b.remainder - a.remainder);
    for (let i = 0; i < 100 - assigned && byRemainder.length > 0; i++) {
      percentages[byRemainder[i % byRemainder.length].i] += 1;
    }
  }

  const slices: MoodSlice[] = presentMoods.map((s, i) => ({
    ...s,
    percentage: percentages[i],
  }));

  // Average score
  const scoredRecords = periodRecords.filter((r) => r.moodScore > 0);
  const avgScore =
    scoredRecords.length > 0
      ? Number(
          (scoredRecords.reduce((sum, r) => sum + r.moodScore, 0) / scoredRecords.length).toFixed(1)
        )
      : null;

  // Daily line points
  const byDate = new Map<string, MoodRecord[]>();
  for (const r of periodRecords) {
    const arr = byDate.get(r.recordDate) || [];
    arr.push(r);
    byDate.set(r.recordDate, arr);
  }

  const linePoints: DailyScorePoint[] = [];
  for (let i = 0; i < dayCount; i++) {
    const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
    const dStr = formatDateYMD(d);
    const dayRecs = byDate.get(dStr) || [];
    const dayScored = dayRecs.filter((r) => r.moodScore > 0);
    const dayAvg =
      dayScored.length > 0
        ? Number((dayScored.reduce((s, r) => s + r.moodScore, 0) / dayScored.length).toFixed(1))
        : null;
    linePoints.push({
      dateStr: dStr,
      shortLabel: `${d.getMonth() + 1}/${d.getDate()}`,
      avgScore: dayAvg,
      count: dayRecs.length,
    });
  }

  const reflections = buildLocalReflections(period, periodRecords, counts, topMood, avgScore);

  return {
    totalCount,
    streakDays,
    topMood,
    topMoodCount,
    avgScore,
    slices,
    linePoints,
    reflections,
  };
}

function buildLocalReflections(
  period: ReviewPeriod,
  records: MoodRecord[],
  counts: Map<MoodType, number>,
  topMood: MoodType | null,
  avgScore: number | null
): string[] {
  const periodWord = period === 'week' ? '这周' : period === 'month' ? '本月' : '近90天';

  if (records.length === 0) {
    return [`${periodWord}还没有情绪记录，试着用几秒钟记下此刻的感受吧。`];
  }

  const pool: string[] = [];
  const tiredCount = counts.get('疲惫') || 0;
  const lowCount = counts.get('低落') || 0;
  const irritableCount = counts.get('烦躁') || 0;
  const happyCount = counts.get('开心') || 0;

  if (topMood) {
    if (tiredCount >= 2 && topMood !== '疲惫') {
      pool.push(`你${periodWord}多数时候比较${topMood}，疲惫出现较多，可以多留出一些休息时间。`);
    } else if (lowCount >= 2 && topMood !== '低落') {
      pool.push(`你${periodWord}以${topMood}为主，偶尔也有低落时刻，允许自己慢下来也很正常。`);
    } else if (irritableCount >= 2 && topMood !== '烦躁') {
      pool.push(`你${periodWord}大部分时候偏向${topMood}，遇到烦躁时不妨深呼吸换个节奏。`);
    } else if (topMood === '疲惫') {
      pool.push(`你${periodWord}疲惫感出现得比较频繁，身体与心绪都在提醒你早点休息。`);
    } else if (topMood === '低落' || topMood === '迷茫') {
      pool.push(`你${periodWord}有不少${topMood}的时刻，不用急着立刻变好，先照顾好日常起居。`);
    } else if (topMood === '开心') {
      pool.push(`你${periodWord}整体明朗开心，这些微小的愉悦感值得被好好珍藏。`);
    } else {
      pool.push(`你${periodWord}多数时候处于${topMood}状态，内心保持着一份难得的平稳。`);
    }
  }

  // Tag correlation template (purely local frequency count)
  const happyTags = new Map<string, number>();
  const allTags = new Map<string, number>();
  for (const r of records) {
    const tList = parseTags(r.tags);
    for (const tag of tList) {
      allTags.set(tag, (allTags.get(tag) || 0) + 1);
      if (r.moodType === '开心' || r.moodType === '平静') {
        happyTags.set(tag, (happyTags.get(tag) || 0) + 1);
      }
    }
  }

  let bestHappyTag = '';
  let bestHappyCount = 0;
  for (const [t, c] of happyTags.entries()) {
    if (c > bestHappyCount) {
      bestHappyCount = c;
      bestHappyTag = t;
    }
  }

  if (bestHappyTag && happyCount > 0) {
    pool.push(`你的开心或平静时刻大多与「${bestHappyTag}」有关，可以多给自己安排这类时光。`);
  } else if (allTags.size > 0) {
    const topTag = Array.from(allTags.entries()).sort((a, b) => b[1] - a[1])[0][0];
    pool.push(`这段时间里，「${topTag}」是你记录中出现最频繁的生活关键词。`);
  }

  if (avgScore !== null) {
    if (avgScore >= 4.0) {
      pool.push(`${periodWord}情绪均分为 ${avgScore} 分，整体状态较为轻盈顺畅。`);
    } else if (avgScore >= 3.0) {
      pool.push(`${periodWord}情绪均分为 ${avgScore} 分，生活有起伏，整体保持在平稳区间。`);
    } else {
      pool.push(`${periodWord}情绪均分为 ${avgScore} 分，辛苦了，记得给疲惫的自己多一点温柔。`);
    }
  }

  if (records.length >= 5) {
    pool.push(`你已经在${periodWord}认真记录了 ${records.length} 次心绪，每一次落笔都是与自己安静对话。`);
  }

  return pool;
}
