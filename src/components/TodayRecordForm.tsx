import React, { useState } from 'react';
import { MoodRecord, MoodType, NewMoodRecord } from '../types/mood';
import {
  BG_COLOR_MAP,
  BG_COLOR_PRESETS,
  MOOD_LIST,
  SCORE_LABELS,
} from '../constants/moodConfig';
import { MoodIcon, STICKERS } from './MoodVisuals';
import { formatChineseDateFull, formatDateYMD, normalizeTagsInput, parseTags } from '../utils/dateAndStats';
import { Check, Palette, Smile } from 'lucide-react';

interface TodayRecordFormProps {
  initialRecord?: MoodRecord;
  quickTags: string[];
  onSave: (data: NewMoodRecord, existingId?: number) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
}

export const TodayRecordForm: React.FC<TodayRecordFormProps> = ({
  initialRecord,
  quickTags,
  onSave,
  onCancel,
  submitLabel = '保存手记',
}) => {
  const isEditing = Boolean(initialRecord);
  const [moodType, setMoodType] = useState<MoodType | null>(
    initialRecord ? initialRecord.moodType : null
  );
  const [moodScore, setMoodScore] = useState<number>(initialRecord?.moodScore ?? 0);
  const [content, setContent] = useState<string>(initialRecord?.content ?? '');
  const [tagsInput, setTagsInput] = useState<string>(initialRecord?.tags ?? '');
  const [stickerId, setStickerId] = useState<string>(initialRecord?.stickerId ?? '');
  const [bgColorCode, setBgColorCode] = useState<string>(initialRecord?.bgColorCode ?? '');
  const [showExtras, setShowExtras] = useState<boolean>(
    Boolean(initialRecord?.stickerId || initialRecord?.bgColorCode)
  );
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  const now = new Date();
  const displayDate = initialRecord
    ? formatChineseDateFull(new Date(`${initialRecord.recordDate}T00:00:00`))
    : formatChineseDateFull(now);

  const currentBgClass = BG_COLOR_MAP[bgColorCode]?.cardClass || BG_COLOR_MAP[''].cardClass;

  const handleToggleQuickTag = (tag: string) => {
    const existing = parseTags(tagsInput);
    if (existing.includes(tag)) {
      setTagsInput(existing.filter((t) => t !== tag).join('，'));
    } else {
      setTagsInput([...existing, tag].join('，'));
    }
  };

  const activeTagsSet = new Set(parseTags(tagsInput));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moodType) {
      setErrorMsg('请先选择此刻的情绪状态');
      return;
    }
    setErrorMsg('');
    setSaving(true);
    try {
      const payload: NewMoodRecord = {
        createTimestamp: initialRecord ? initialRecord.createTimestamp : Date.now(),
        recordDate: initialRecord ? initialRecord.recordDate : formatDateYMD(new Date()),
        moodType,
        moodScore,
        content: content.trim(),
        tags: normalizeTagsInput(tagsInput),
        stickerId,
        bgColorCode,
        isStar: initialRecord ? initialRecord.isStar : false,
      };
      await onSave(payload, initialRecord?.id);

      if (!isEditing) {
        setMoodType(null);
        setMoodScore(0);
        setContent('');
        setTagsInput('');
        setStickerId('');
        setBgColorCode('');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-3xl border border-[#E5E7E4] dark:border-[#2A3030] p-5 sm:p-6 transition-colors duration-200 ${currentBgClass}`}
    >
      {/* Date Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-black/[0.06] dark:border-white/[0.07]">
        <div>
          <p className="text-xs text-[#6E7876] dark:text-[#96A19F] tabular-nums">
            {isEditing ? `编辑手记 · ${displayDate}` : displayDate}
          </p>
          <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-[#252C2B] dark:text-[#EEF2F1]">
            {isEditing ? '调整这刻记录' : '此刻感觉如何？'}
          </h2>
        </div>

        {/* Optional quick indicator of chosen sticker */}
        {stickerId && (
          <div
            className="flex items-center justify-center w-10 h-10 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05]"
            title="已选贴纸"
          >
            {STICKERS.find((s) => s.id === stickerId)?.render(26)}
          </div>
        )}
      </div>

      {/* Mood Selection Grid (6 moods, 44px+ hitboxes) */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-sm font-medium text-[#3D4645] dark:text-[#CBD3D1]">
            选择情绪
          </span>
          {errorMsg && (
            <span className="text-xs font-medium text-[#B85C52] dark:text-[#E58E85]">
              {errorMsg}
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {MOOD_LIST.map((item) => {
            const selected = moodType === item.type;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => {
                  setMoodType(item.type);
                  if (errorMsg) setErrorMsg('');
                }}
                aria-pressed={selected}
                className={`min-h-[68px] flex flex-col items-center justify-center gap-1.5 rounded-2xl px-2 py-2.5 border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E8C88] ${
                  selected
                    ? `${item.softBgLight} ${item.softBgDark} border-current ${item.textLight} ${item.textDark} scale-[1.02]`
                    : 'bg-black/[0.02] dark:bg-white/[0.03] border-transparent text-[#586260] dark:text-[#A3AEAC] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                }`}
              >
                <MoodIcon mood={item.type} size={26} />
                <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional Mood Score 1~5 */}
      <div className="pt-4 mt-4 border-t border-black/[0.05] dark:border-white/[0.06]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#5A6462] dark:text-[#9AA5A3]">
            情绪打分（可选）
          </span>
          <span className="text-xs text-[#6E7876] dark:text-[#8E9A98] tabular-nums">
            {moodScore > 0 ? `${moodScore} 分 · ${SCORE_LABELS[moodScore]}` : '未打分'}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((score) => {
            const active = moodScore === score;
            return (
              <button
                key={score}
                type="button"
                onClick={() => setMoodScore(active ? 0 : score)}
                aria-pressed={active}
                className={`min-h-[44px] rounded-xl text-sm font-medium tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E8C88] ${
                  active
                    ? 'bg-[#5E8C88] text-white dark:bg-[#6A9B97] dark:text-[#111515]'
                    : 'bg-black/[0.03] dark:bg-white/[0.04] text-[#4C5654] dark:text-[#B2BCBA] hover:bg-black/[0.06] dark:hover:bg-white/[0.08]'
                }`}
              >
                {score}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Textarea (max 300 chars, optional) */}
      <div className="pt-4 mt-4 border-t border-black/[0.05] dark:border-white/[0.06]">
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="mood-content-input"
            className="text-xs font-medium text-[#5A6462] dark:text-[#9AA5A3]"
          >
            写下此刻想法（选填）
          </label>
          <span className="text-xs text-[#7D8785] dark:text-[#879290] tabular-nums">
            {content.length}/300
          </span>
        </div>
        <textarea
          id="mood-content-input"
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 300))}
          maxLength={300}
          rows={3}
          placeholder="发生了什么，或者只是单纯记下此刻的感受……"
          className="w-full resize-none rounded-2xl border border-black/[0.08] dark:border-white/[0.09] bg-white/70 dark:bg-black/20 px-3.5 py-2.5 text-sm leading-relaxed text-[#252C2B] dark:text-[#E8EEEC] placeholder:text-[#9AA3A1] dark:placeholder:text-[#66706E] focus:outline-none focus:ring-2 focus:ring-[#5E8C88]/60"
        />
      </div>

      {/* Custom Tags Input + Quick Tags */}
      <div className="pt-3.5">
        <label
          htmlFor="mood-tags-input"
          className="block text-xs font-medium text-[#5A6462] dark:text-[#9AA5A3] mb-1.5"
        >
          标签（逗号分隔，选填）
        </label>
        <input
          id="mood-tags-input"
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="例如：独处，工作，睡眠"
          className="w-full min-h-[44px] rounded-xl border border-black/[0.08] dark:border-white/[0.09] bg-white/70 dark:bg-black/20 px-3.5 py-2 text-sm text-[#252C2B] dark:text-[#E8EEEC] placeholder:text-[#9AA3A1] dark:placeholder:text-[#66706E] focus:outline-none focus:ring-2 focus:ring-[#5E8C88]/60"
        />

        {quickTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {quickTags.map((tag) => {
              const active = activeTagsSet.has(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleQuickTag(tag)}
                  className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-[#5E8C88]/15 text-[#3B6460] dark:bg-[#6A9B97]/25 dark:text-[#A4CECA]'
                      : 'bg-black/[0.03] dark:bg-white/[0.05] text-[#5F6967] dark:text-[#9EA9A7] hover:bg-black/[0.06] dark:hover:bg-white/[0.09]'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Optional Light Features Toggle: Built-in Sticker & Background Color */}
      <div className="pt-3.5 mt-3.5 border-t border-black/[0.05] dark:border-white/[0.06]">
        <button
          type="button"
          onClick={() => setShowExtras((prev) => !prev)}
          className="min-h-[44px] w-full flex items-center justify-between text-xs font-medium text-[#5A6462] dark:text-[#9AA5A3] hover:text-[#252C2B] dark:hover:text-[#E5ECEA] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Smile className="w-4 h-4 text-[#5E8C88]" />
            <span>贴纸与纸张底色（可选）</span>
          </span>
          <span className="text-[#5E8C88] dark:text-[#86B6B2]">
            {showExtras ? '收起' : '展开'}
          </span>
        </button>

        {showExtras && (
          <div className="pt-2 pb-1 space-y-3.5">
            {/* Stickers */}
            <div>
              <div className="text-xs text-[#6E7876] dark:text-[#8F9A98] mb-2">
                内置治愈贴纸
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {STICKERS.map((s) => {
                  const active = stickerId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStickerId(active ? '' : s.id)}
                      title={s.label}
                      aria-pressed={active}
                      className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl border transition-colors ${
                        active
                          ? 'border-[#5E8C88] bg-[#5E8C88]/10 dark:bg-[#5E8C88]/20'
                          : 'border-transparent bg-black/[0.025] dark:bg-white/[0.04] hover:bg-black/[0.05]'
                      }`}
                    >
                      {s.render(22)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Paper Tints */}
            <div>
              <div className="flex items-center gap-1.5 text-xs text-[#6E7876] dark:text-[#8F9A98] mb-2">
                <Palette className="w-3.5 h-3.5" />
                <span>手记底色</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {BG_COLOR_PRESETS.map((preset) => {
                  const active = bgColorCode === preset.code;
                  return (
                    <button
                      key={preset.code || 'default'}
                      type="button"
                      onClick={() => setBgColorCode(preset.code)}
                      aria-pressed={active}
                      className={`min-h-[44px] px-3 rounded-xl border flex items-center gap-2 text-xs font-medium transition-colors ${
                        active
                          ? 'border-[#5E8C88] text-[#2B4946] dark:text-[#B5DCD8] bg-[#5E8C88]/10'
                          : 'border-black/[0.07] dark:border-white/[0.08] text-[#555F5D] dark:text-[#A5B0AE]'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-black/15 shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: preset.swatchHex }}
                      >
                        {active && <Check className="w-2.5 h-2.5 text-[#355451]" />}
                      </span>
                      <span className="whitespace-nowrap">{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit Actions */}
      <div className="pt-4 flex items-center gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[46px] px-5 rounded-2xl border border-black/[0.1] dark:border-white/[0.12] text-sm font-medium text-[#4C5654] dark:text-[#CBD3D1] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors whitespace-nowrap"
          >
            取消
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex-1 min-h-[46px] px-5 rounded-2xl bg-[#5E8C88] hover:bg-[#4F7B77] active:scale-[0.99] dark:bg-[#6A9B97] dark:hover:bg-[#78AAA6] text-white dark:text-[#111515] text-sm font-semibold transition-all disabled:opacity-60 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E8C88] focus-visible:ring-offset-2"
        >
          {saving ? '保存中...' : submitLabel}
        </button>
      </div>
    </form>
  );
};
