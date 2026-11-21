import React, { useState } from 'react';
import { ReminderSettings, ThemeMode } from '../types/mood';
import { APP_PACKAGE_NAME, REMINDER_MESSAGES } from '../constants/moodConfig';
import { PrivacyPolicyContent } from './ConsentModal';
import { Bell, ChevronRight, Monitor, Moon, Plus, ShieldCheck, Sun, Tag, Trash2, X } from 'lucide-react';

interface SettingsViewProps {
  themeMode: ThemeMode;
  onChangeTheme: (mode: ThemeMode) => void;
  reminder: ReminderSettings;
  onUpdateReminder: (next: ReminderSettings) => void;
  quickTags: string[];
  onUpdateQuickTags: (tags: string[]) => void;
  totalRecordCount: number;
  onClearAllRecords: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  themeMode,
  onChangeTheme,
  reminder,
  onUpdateReminder,
  quickTags,
  onUpdateQuickTags,
  totalRecordCount,
  onClearAllRecords,
}) => {
  const [permissionDenied, setPermissionDenied] = useState<boolean>(() => {
    if (typeof Notification === 'undefined') return false;
    return Notification.permission === 'denied';
  });

  const [newTagInput, setNewTagInput] = useState<string>('');
  const [clearStep, setClearStep] = useState<0 | 1 | 2>(0);
  const [clearing, setClearing] = useState<boolean>(false);
  const [showPrivacy, setShowPrivacy] = useState<boolean>(false);

  const handleToggleReminder = async () => {
    if (reminder.enabled) {
      onUpdateReminder({ ...reminder, enabled: false });
      return;
    }

    // Only request notification permission when user manually turns ON reminder
    if (typeof Notification === 'undefined') {
      setPermissionDenied(true);
      return;
    }

    if (Notification.permission === 'granted') {
      setPermissionDenied(false);
      onUpdateReminder({ ...reminder, enabled: true });
      return;
    }

    if (Notification.permission === 'denied') {
      setPermissionDenied(true);
      return;
    }

    try {
      const result = await Notification.requestPermission();
      if (result === 'granted') {
        setPermissionDenied(false);
        onUpdateReminder({ ...reminder, enabled: true });
      } else {
        setPermissionDenied(true);
      }
    } catch {
      setPermissionDenied(true);
    }
  };

  const handleAddQuickTag = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newTagInput.trim().replace(/[，,]/g, '');
    if (!cleaned) return;
    if (!quickTags.includes(cleaned)) {
      onUpdateQuickTags([...quickTags, cleaned]);
    }
    setNewTagInput('');
  };

  const handleRemoveQuickTag = (tag: string) => {
    onUpdateQuickTags(quickTags.filter((t) => t !== tag));
  };

  const handleConfirmClearAll = async () => {
    setClearing(true);
    try {
      await onClearAllRecords();
      setClearStep(0);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* 1. Appearance Settings */}
      <section
        aria-label="外观设置"
        className="rounded-3xl border border-[#E5E7E4] dark:border-[#2A3030] bg-white dark:bg-[#1D2121] p-5"
      >
        <h2 className="text-base font-semibold text-[#252C2B] dark:text-[#EEF2F1]">
          外观模式
        </h2>
        <p className="text-xs text-[#7B8583] dark:text-[#8C9795] mt-0.5 mb-3.5">
          选择浅色、深色或自动跟随系统主题
        </p>

        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { value: 'light', label: '浅色模式', Icon: Sun },
              { value: 'dark', label: '深色模式', Icon: Moon },
              { value: 'system', label: '跟随系统', Icon: Monitor },
            ] as const
          ).map(({ value, label, Icon }) => {
            const active = themeMode === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onChangeTheme(value)}
                aria-pressed={active}
                className={`min-h-[48px] px-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-medium transition-colors ${
                  active
                    ? 'border-[#5E8C88] bg-[#5E8C88]/12 text-[#2E5450] dark:bg-[#6A9B97]/20 dark:text-[#A4CECA]'
                    : 'border-black/[0.06] dark:border-white/[0.08] text-[#555F5D] dark:text-[#9CA8A6] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">{label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Independent Privacy Policy Button */}
      <button
        type="button"
        onClick={() => setShowPrivacy(true)}
        className="w-full min-h-[60px] rounded-3xl border border-[#E5E7E4] dark:border-[#2A3030] bg-white dark:bg-[#1D2121] px-5 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.03] active:scale-[0.995] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E8C88]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#5E8C88]/12 dark:bg-[#5E8C88]/20 flex items-center justify-center text-[#5E8C88] dark:text-[#86B6B2] shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#252C2B] dark:text-[#EEF2F1]">
              隐私政策
            </div>
            <div className="text-xs text-[#7B8583] dark:text-[#8C9795] truncate">
              查看本机数据与权限说明
            </div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-[#8A9492] shrink-0" />
      </button>

      {/* 2. Daily Local Reminder */}
      <section
        aria-label="每日提醒设置"
        className="rounded-3xl border border-[#E5E7E4] dark:border-[#2A3030] bg-white dark:bg-[#1D2121] p-5 space-y-4"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#5E8C88]/12 dark:bg-[#5E8C88]/20 flex items-center justify-center text-[#5E8C88] dark:text-[#86B6B2] shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#252C2B] dark:text-[#EEF2F1]">
                每日本地提醒
              </h2>
              <p className="text-xs text-[#7B8583] dark:text-[#8C9795] mt-0.5">
                仅在开启时请求系统通知权限，不开启不申请
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={reminder.enabled}
            aria-label="开启每日本地提醒"
            onClick={handleToggleReminder}
            className={`relative w-12 h-7 rounded-full transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E8C88] ${
              reminder.enabled
                ? 'bg-[#5E8C88] dark:bg-[#6A9B97]'
                : 'bg-[#D3D8D6] dark:bg-[#3A4240]'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                reminder.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {permissionDenied && (
          <p className="text-xs text-[#A85A51] dark:text-[#DF9D94] bg-[#F8ECEA] dark:bg-[#2F201E] rounded-xl px-3.5 py-2.5">
            提醒功能无法使用，不影响其他功能
          </p>
        )}

        {reminder.enabled && !permissionDenied && (
          <div className="pt-3 border-t border-black/[0.05] dark:border-white/[0.06] space-y-3.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="reminder-time"
                className="text-sm text-[#3D4645] dark:text-[#CBD3D1]"
              >
                提醒时间
              </label>
              <input
                id="reminder-time"
                type="time"
                value={reminder.time}
                onChange={(e) =>
                  onUpdateReminder({ ...reminder, time: e.target.value || '21:00' })
                }
                className="min-h-[44px] px-3 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-[#F7F6F2] dark:bg-[#151818] text-sm text-[#252C2B] dark:text-[#EEF2F1] tabular-nums"
              />
            </div>

            <div>
              <span className="block text-xs text-[#6E7876] dark:text-[#96A2A0] mb-2">
                提醒文案（内置可选）
              </span>
              <div className="space-y-2">
                {REMINDER_MESSAGES.map((msg, idx) => {
                  const selected = reminder.messageIndex === idx;
                  return (
                    <button
                      key={msg}
                      type="button"
                      onClick={() =>
                        onUpdateReminder({ ...reminder, messageIndex: idx })
                      }
                      className={`w-full min-h-[44px] px-3.5 py-2 rounded-xl border text-left text-xs font-medium transition-colors ${
                        selected
                          ? 'border-[#5E8C88] bg-[#5E8C88]/10 text-[#2E5450] dark:text-[#A4CECA]'
                          : 'border-black/[0.06] dark:border-white/[0.08] text-[#555F5D] dark:text-[#9CA8A6]'
                      }`}
                    >
                      {msg}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3. Quick Tags Management (Light V1.1 helper) */}
      <section
        aria-label="常用标签管理"
        className="rounded-3xl border border-[#E5E7E4] dark:border-[#2A3030] bg-white dark:bg-[#1D2121] p-5 space-y-3.5"
      >
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-[#5E8C88]" />
          <h2 className="text-base font-semibold text-[#252C2B] dark:text-[#EEF2F1]">
            常用标签
          </h2>
        </div>
        <p className="text-xs text-[#7B8583] dark:text-[#8C9795]">
          预先维护常用标签，写手记时可一键点选
        </p>

        <form onSubmit={handleAddQuickTag} className="flex gap-2">
          <input
            type="text"
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            maxLength={12}
            placeholder="输入新标签名称"
            className="flex-1 min-h-[44px] px-3.5 rounded-xl border border-black/[0.08] dark:border-white/[0.09] bg-[#F7F6F2] dark:bg-[#151818] text-sm text-[#252C2B] dark:text-[#EEF2F1] placeholder:text-[#96A09E] focus:outline-none focus:ring-2 focus:ring-[#5E8C88]/60"
          />
          <button
            type="submit"
            className="min-h-[44px] px-4 rounded-xl bg-[#5E8C88] text-white dark:bg-[#6A9B97] dark:text-[#111515] text-xs font-medium flex items-center gap-1 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>添加</span>
          </button>
        </form>

        {quickTags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {quickTags.map((tag) => (
              <div
                key={tag}
                className="inline-flex items-center gap-1 pl-3 pr-1 py-1 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] text-xs text-[#3D4645] dark:text-[#CBD3D1]"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveQuickTag(tag)}
                  aria-label={`移除标签 ${tag}`}
                  className="min-w-[30px] min-h-[30px] flex items-center justify-center rounded-lg text-[#8A9492] hover:text-[#C26A60]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Data Management */}
      <section
        aria-label="数据管理"
        className="rounded-3xl border border-[#E5E7E4] dark:border-[#2A3030] bg-white dark:bg-[#1D2121] p-5 space-y-3"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#252C2B] dark:text-[#EEF2F1]">
            数据管理
          </h2>
          <span className="text-xs text-[#7B8583] dark:text-[#8C9795] tabular-nums">
            本机共 {totalRecordCount} 条手记
          </span>
        </div>
        <p className="text-xs leading-relaxed text-[#6E7876] dark:text-[#96A2A0]">
          所有手记仅保存在本机，不上传至任何服务器，卸载或清除本地存储后数据会全部丢失（无备份功能）。
        </p>

        <button
          type="button"
          disabled={totalRecordCount === 0}
          onClick={() => setClearStep(1)}
          className="min-h-[46px] w-full rounded-2xl border border-[#DFB9B5] dark:border-[#5C3632] bg-[#FAF0EF] dark:bg-[#2A1D1C] text-[#A84D44] dark:text-[#E59890] text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#F5E4E2] dark:hover:bg-[#352322] disabled:opacity-45 disabled:pointer-events-none transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>一键清空全部手记</span>
        </button>
      </section>

      {/* 5. About & Disclaimer */}
      <section
        aria-label="关于情序手记"
        className="rounded-3xl border border-[#E5E7E4] dark:border-[#2A3030] bg-white dark:bg-[#1D2121] p-5 space-y-3"
      >
        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-semibold text-[#252C2B] dark:text-[#EEF2F1]">
            关于情序手记
          </h2>
          <span className="text-xs text-[#7B8583] dark:text-[#8C9795] tabular-nums">
            V1.0.0 · {APP_PACKAGE_NAME}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-[#5E6866] dark:text-[#9CA8A6]">
          情序手记是一款轻量、安静的本地情绪手记工具，只为给你留一方纯粹记录心绪的小角落。
        </p>
        <div className="pt-3 border-t border-black/[0.05] dark:border-white/[0.06]">
          <p className="text-xs leading-relaxed text-[#6E7876] dark:text-[#8F9A98]">
            免责声明：本App仅为情绪记录工具，
            <strong className="font-semibold text-[#3D4645] dark:text-[#CBD3D1]">
              不能替代心理咨询与医疗诊断，长期情绪不适，请及时寻求专业心理/医疗帮助。
            </strong>
          </p>
        </div>
      </section>

      {/* Two-Layer Clear All Confirmation Modal */}
      {clearStep > 0 && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#1D2121] border border-[#E5E7E4] dark:border-[#2A3030] p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-semibold text-[#252C2B] dark:text-[#EEF2F1]">
              {clearStep === 1 ? '确定清空全部手记吗？' : '最后确认：永久删除'}
            </h3>
            <p className="text-sm leading-relaxed text-[#5A6462] dark:text-[#A3AEAC]">
              {clearStep === 1
                ? `本机共存有 ${totalRecordCount} 条手记。清空后所有情绪记录将永久删除，无法恢复。`
                : '数据一旦清空无法以任何方式找回。确定要清空全部手记吗？'}
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setClearStep(0)}
                disabled={clearing}
                className="flex-1 min-h-[44px] rounded-2xl border border-black/[0.1] dark:border-white/[0.12] text-sm font-medium text-[#4C5654] dark:text-[#CBD3D1]"
              >
                取消
              </button>
              {clearStep === 1 ? (
                <button
                  type="button"
                  onClick={() => setClearStep(2)}
                  className="flex-1 min-h-[44px] rounded-2xl bg-[#C26A60] text-white text-sm font-semibold"
                >
                  继续清空
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmClearAll}
                  disabled={clearing}
                  className="flex-1 min-h-[44px] rounded-2xl bg-[#A8453B] text-white text-sm font-semibold disabled:opacity-60"
                >
                  {clearing ? '清空中...' : '确认永久清空'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Centered Privacy Policy Modal */}
      {showPrivacy && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-policy-title"
          onClick={() => setShowPrivacy(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md max-h-[80dvh] flex flex-col rounded-3xl bg-white dark:bg-[#1D2121] border border-[#E5E7E4] dark:border-[#2A3030] shadow-xl overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.07] flex items-center justify-between gap-3 shrink-0">
              <h3
                id="privacy-policy-title"
                className="text-base font-semibold text-[#252C2B] dark:text-[#EEF2F1]"
              >
                《情序手记》隐私政策
              </h3>
              <button
                type="button"
                onClick={() => setShowPrivacy(false)}
                aria-label="关闭隐私政策"
                className="min-w-[40px] min-h-[40px] -mr-2 flex items-center justify-center rounded-xl text-[#7B8583] hover:text-[#252C2B] dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#F7F6F2] dark:bg-[#161A1A] px-5 py-4">
              <PrivacyPolicyContent showTitle={false} />
            </div>

            <div className="px-5 py-3.5 border-t border-black/[0.06] dark:border-white/[0.07] shrink-0">
              <button
                type="button"
                onClick={() => setShowPrivacy(false)}
                className="w-full min-h-[44px] rounded-2xl bg-[#5E8C88] hover:bg-[#4F7B77] dark:bg-[#6A9B97] dark:hover:bg-[#78AAA6] text-white dark:text-[#111515] text-sm font-semibold transition-colors"
              >
                我已了解
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
