import React from 'react';
import { MoodRecord } from '../types/mood';
import { BG_COLOR_MAP, MOOD_MAP, SCORE_LABELS } from '../constants/moodConfig';
import { MoodIcon, STICKER_MAP } from './MoodVisuals';
import { formatChineseDateShort, formatTimeHM, parseTags } from '../utils/dateAndStats';
import { Pencil, Star, Trash2 } from 'lucide-react';

interface RecordCardProps {
  record: MoodRecord;
  showDate?: boolean;
  onToggleStar: (record: MoodRecord) => void;
  onEdit: (record: MoodRecord) => void;
  onRequestDelete: (record: MoodRecord) => void;
}

const RecordCardInner: React.FC<RecordCardProps> = ({
  record,
  showDate = false,
  onToggleStar,
  onEdit,
  onRequestDelete,
}) => {
  const moodMeta = MOOD_MAP[record.moodType];
  const cardBgClass = BG_COLOR_MAP[record.bgColorCode]?.cardClass || BG_COLOR_MAP[''].cardClass;
  const sticker = record.stickerId ? STICKER_MAP[record.stickerId] : undefined;
  const tagList = parseTags(record.tags);

  return (
    <article
      className={`rounded-2xl border border-[#E5E7E4] dark:border-[#2A3030] p-4 transition-colors [content-visibility:auto] [contain-intrinsic-size:auto_6rem] ${cardBgClass}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0">
            <MoodIcon mood={record.moodType} size={30} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-sm font-semibold ${moodMeta.textLight} ${moodMeta.textDark}`}>
                {record.moodType}
              </span>
              {record.moodScore > 0 && (
                <>
                  <span className="text-[#B5BEBC] dark:text-[#55605E]" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-xs text-[#5E6866] dark:text-[#9CA8A6] tabular-nums">
                    {record.moodScore}/5分 ({SCORE_LABELS[record.moodScore]})
                  </span>
                </>
              )}
            </div>
            <div className="text-xs text-[#7B8583] dark:text-[#889492] tabular-nums mt-0.5">
              {showDate && <span>{formatChineseDateShort(record.recordDate)} · </span>}
              <span>{formatTimeHM(record.createTimestamp)}</span>
            </div>
          </div>
        </div>

        {/* Actions: Sticker + Star + Edit + Delete */}
        <div className="flex items-center shrink-0 -mr-1">
          {sticker && (
            <span className="mr-1 flex items-center justify-center" title={sticker.label}>
              {sticker.render(24)}
            </span>
          )}
          <button
            type="button"
            onClick={() => onToggleStar(record)}
            aria-label={record.isStar ? '取消收藏' : '收藏手记'}
            aria-pressed={record.isStar}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#8A9492] hover:text-[#D59B49] dark:text-[#7E8987] dark:hover:text-[#E7BC78] transition-colors"
          >
            <Star
              className={`w-[18px] h-[18px] ${
                record.isStar ? 'fill-[#D59B49] text-[#D59B49]' : ''
              }`}
            />
          </button>
          <button
            type="button"
            onClick={() => onEdit(record)}
            aria-label="编辑手记"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#8A9492] hover:text-[#3A4342] dark:text-[#7E8987] dark:hover:text-[#E5ECEA] transition-colors"
          >
            <Pencil className="w-[17px] h-[17px]" />
          </button>
          <button
            type="button"
            onClick={() => onRequestDelete(record)}
            aria-label="删除手记"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#8A9492] hover:text-[#C26A60] dark:text-[#7E8987] dark:hover:text-[#DF9D94] transition-colors"
          >
            <Trash2 className="w-[17px] h-[17px]" />
          </button>
        </div>
      </div>

      {/* Journal Body */}
      {record.content ? (
        <p className="mt-3 text-sm leading-relaxed text-[#2D3534] dark:text-[#DFE6E4] whitespace-pre-wrap break-words">
          {record.content}
        </p>
      ) : (
        <p className="mt-2.5 text-xs text-[#919B99] dark:text-[#6E7A78]">
          仅记录了情绪状态
        </p>
      )}

      {/* Unboxed Metadata Tags */}
      {tagList.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-black/[0.05] dark:border-white/[0.06] flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-[#697472] dark:text-[#96A2A0]">
          {tagList.map((tag, idx) => (
            <React.Fragment key={`${tag}-${idx}`}>
              {idx > 0 && (
                <span aria-hidden="true" className="text-[#C0C8C6] dark:text-[#4E5856]">
                  ·
                </span>
              )}
              <span>#{tag}</span>
            </React.Fragment>
          ))}
        </div>
      )}
    </article>
  );
};

// Skip re-rendering unchanged cards when a sibling record is toggled or edited.
export const RecordCard = React.memo(RecordCardInner);
