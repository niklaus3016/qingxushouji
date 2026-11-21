import React, { useCallback, useEffect, useState } from 'react';
import {
  AppTab,
  MoodRecord,
  NewMoodRecord,
  ReminderSettings,
  ThemeMode,
} from './types/mood';
import {
  addRecord,
  clearAllRecords,
  deleteRecord,
  getAllRecords,
  loadQuickTags,
  loadReminderSettings,
  loadThemeMode,
  saveQuickTags,
  saveReminderSettings,
  saveThemeMode,
  updateRecord,
} from './db/moodDb';
import { REMINDER_MESSAGES } from './constants/moodConfig';
import { formatDateYMD } from './utils/dateAndStats';
import { HomeView } from './components/HomeView';
import { CalendarView } from './components/CalendarView';
import { ReviewView } from './components/ReviewView';
import { SettingsView } from './components/SettingsView';
import { TodayRecordForm } from './components/TodayRecordForm';
import { ConsentModal, hasAgreedConsent } from './components/ConsentModal';
import { CalendarDays, PenLine, PieChart, Settings, X } from 'lucide-react';

const TAB_ITEMS: { id: AppTab; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { id: 'home', label: '首页', Icon: PenLine },
  { id: 'calendar', label: '手记日历', Icon: CalendarDays },
  { id: 'review', label: '情绪复盘', Icon: PieChart },
  { id: 'settings', label: '设置', Icon: Settings },
];

const TAB_TITLES: Record<AppTab, string> = {
  home: '情序手记',
  calendar: '手记日历',
  review: '情绪复盘',
  settings: '设置',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [records, setRecords] = useState<MoodRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const [selectedDate, setSelectedDate] = useState<string>(() => formatDateYMD(new Date()));
  const [editingRecord, setEditingRecord] = useState<MoodRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<MoodRecord | null>(null);
  const [toastMsg, setToastMsg] = useState<string>('');

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => loadThemeMode());
  const [reminder, setReminder] = useState<ReminderSettings>(() => loadReminderSettings());
  const [quickTags, setQuickTags] = useState<string[]>(() => loadQuickTags());
  const [consentGiven, setConsentGiven] = useState<boolean>(() => hasAgreedConsent());

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
  }, []);

  useEffect(() => {
    if (!toastMsg) return;
    const timer = window.setTimeout(() => setToastMsg(''), 2200);
    return () => window.clearTimeout(timer);
  }, [toastMsg]);

  // Initial local DB load (no splash screen)
  useEffect(() => {
    let active = true;
    getAllRecords()
      .then((list) => {
        if (active) {
          setRecords(list);
          setIsLoaded(true);
        }
      })
      .catch(() => {
        if (active) setIsLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  // Theme application (Light / Dark / System)
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const shouldBeDark =
        themeMode === 'dark' || (themeMode === 'system' && media.matches);
      if (shouldBeDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();

    if (themeMode === 'system') {
      media.addEventListener('change', applyTheme);
      return () => media.removeEventListener('change', applyTheme);
    }
  }, [themeMode]);

  // Local reminder check while app is open (zero network)
  useEffect(() => {
    if (!reminder.enabled) return;
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

    const checkReminder = () => {
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;
      const todayKey = formatDateYMD(now);
      const lastFired = localStorage.getItem('qingxu_last_reminded_date');
      if (hhmm === reminder.time && lastFired !== todayKey) {
        try {
          new Notification('情序手记', {
            body: REMINDER_MESSAGES[reminder.messageIndex] || REMINDER_MESSAGES[0],
          });
          // Only mark as delivered once the notification was actually created.
          localStorage.setItem('qingxu_last_reminded_date', todayKey);
        } catch {
          // Notification construction may be restricted in certain iframe sandboxes
        }
      }
    };

    checkReminder();
    const interval = window.setInterval(checkReminder, 30000);
    return () => window.clearInterval(interval);
  }, [reminder]);

  const handleChangeTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    saveThemeMode(mode);
  };

  const handleUpdateReminder = (next: ReminderSettings) => {
    setReminder(next);
    saveReminderSettings(next);
  };

  const handleUpdateQuickTags = (tags: string[]) => {
    setQuickTags(tags);
    saveQuickTags(tags);
  };

  const handleAddRecord = async (data: NewMoodRecord) => {
    const created = await addRecord(data);
    setRecords((prev) =>
      [created, ...prev].sort((a, b) => b.createTimestamp - a.createTimestamp)
    );
    showToast('已记下此刻心情');
  };

  const handleSaveEditedRecord = async (data: NewMoodRecord, existingId?: number) => {
    if (!existingId || !editingRecord) return;
    const updated: MoodRecord = {
      ...data,
      id: existingId,
    };
    await updateRecord(updated);
    setRecords((prev) =>
      prev.map((item) => (item.id === existingId ? updated : item))
    );
    setEditingRecord(null);
    showToast('手记已更新');
  };

  const handleToggleStar = useCallback(async (record: MoodRecord) => {
    const updated: MoodRecord = { ...record, isStar: !record.isStar };
    await updateRecord(updated);
    setRecords((prev) =>
      prev.map((item) => (item.id === record.id ? updated : item))
    );
  }, []);

  const handleConfirmDelete = async () => {
    if (!deletingRecord) return;
    const id = deletingRecord.id;
    await deleteRecord(id);
    setRecords((prev) => prev.filter((item) => item.id !== id));
    setDeletingRecord(null);
    showToast('手记已删除');
  };

  const handleClearAllRecords = async () => {
    await clearAllRecords();
    setRecords([]);
    showToast('已清空全部本地手记');
  };

  const handleJumpToCalendarDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    setActiveTab('calendar');
  };

  return (
    <div className="min-h-dvh flex flex-col bg-[#F7F6F2] text-[#252C2B] dark:bg-[#141717] dark:text-[#E7ECEB] transition-colors duration-200">
      {/* Compact Sticky Top App Bar (52px) */}
      <header className="sticky top-0 z-30 h-[calc(52px+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] bg-[#F7F6F2]/90 dark:bg-[#141717]/90 backdrop-blur-md border-b border-black/[0.06] dark:border-white/[0.07]">
        <div className="max-w-5xl mx-auto h-full px-4 flex items-center justify-between">
          {/* Left Spacer to keep title strictly centered */}
          <div className="w-11 shrink-0" />

          <h1 className="text-base font-semibold tracking-tight text-[#252C2B] dark:text-[#EEF2F1] whitespace-nowrap">
            {TAB_TITLES[activeTab]}
          </h1>

          {/* Right Action: Single Settings Icon on Home (empty placeholder elsewhere) */}
          <div className="w-11 shrink-0 flex items-center justify-end">
            {activeTab === 'home' && (
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                aria-label="打开设置"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#5A6462] dark:text-[#9CA8A6] hover:text-[#252C2B] dark:hover:text-white transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Scrollable Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-5 pb-[calc(6rem+env(safe-area-inset-bottom))]">
        {!isLoaded ? (
          <div className="py-20 text-center text-xs text-[#858F8D]">正在加载本地手记...</div>
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeView
                records={records}
                quickTags={quickTags}
                onAddRecord={handleAddRecord}
                onToggleStar={handleToggleStar}
                onEditRecord={setEditingRecord}
                onDeleteRecord={setDeletingRecord}
                onJumpToCalendarDate={handleJumpToCalendarDate}
              />
            )}
            {activeTab === 'calendar' && (
              <CalendarView
                records={records}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onToggleStar={handleToggleStar}
                onEditRecord={setEditingRecord}
                onDeleteRecord={setDeletingRecord}
              />
            )}
            {activeTab === 'review' && <ReviewView records={records} />}
            {activeTab === 'settings' && (
              <SettingsView
                themeMode={themeMode}
                onChangeTheme={handleChangeTheme}
                reminder={reminder}
                onUpdateReminder={handleUpdateReminder}
                quickTags={quickTags}
                onUpdateQuickTags={handleUpdateQuickTags}
                totalRecordCount={records.length}
                onClearAllRecords={handleClearAllRecords}
              />
            )}
          </>
        )}
      </main>

      {/* Fixed Bottom Tab Bar (60px) */}
      <nav
        aria-label="主导航"
        className="fixed bottom-0 left-0 right-0 z-40 h-[calc(60px+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] bg-white/92 dark:bg-[#191D1D]/92 backdrop-blur-md border-t border-black/[0.06] dark:border-white/[0.07]"
      >
        <div className="max-w-2xl mx-auto h-full grid grid-cols-4 items-center">
          {TAB_ITEMS.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                aria-current={active ? 'page' : undefined}
                className={`h-full flex flex-col items-center justify-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#5E8C88] ${
                  active
                    ? 'text-[#5E8C88] dark:text-[#86B6B2]'
                    : 'text-[#7B8583] dark:text-[#808C8A] hover:text-[#3A4342] dark:hover:text-[#CBD3D1]'
                }`}
              >
                <Icon className="w-[21px] h-[21px]" />
                <span className="text-[11px] font-medium leading-none whitespace-nowrap">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Edit Record Modal */}
      {editingRecord && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="编辑手记"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="w-full sm:max-w-lg max-h-[90dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#F7F6F2] dark:bg-[#141717] p-4 shadow-2xl">
            <div className="flex items-center justify-end mb-2 sm:hidden">
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                aria-label="关闭编辑"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#6E7876]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <TodayRecordForm
              initialRecord={editingRecord}
              quickTags={quickTags}
              submitLabel="保存修改"
              onSave={handleSaveEditedRecord}
              onCancel={() => setEditingRecord(null)}
            />
          </div>
        </div>
      )}

      {/* Delete Single Record Confirmation Modal */}
      {deletingRecord && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="确认删除手记"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#1D2121] border border-[#E5E7E4] dark:border-[#2A3030] p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-semibold text-[#252C2B] dark:text-[#EEF2F1]">
              删除这条手记？
            </h3>
            <p className="text-sm leading-relaxed text-[#5A6462] dark:text-[#A3AEAC]">
              删除后这条情绪记录将无法恢复。
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setDeletingRecord(null)}
                className="flex-1 min-h-[44px] rounded-2xl border border-black/[0.1] dark:border-white/[0.12] text-sm font-medium text-[#4C5654] dark:text-[#CBD3D1]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 min-h-[44px] rounded-2xl bg-[#C26A60] text-white text-sm font-semibold"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiet Toast Notification */}
      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-[#2C3534] dark:bg-[#E7ECEB] text-white dark:text-[#141717] text-xs font-medium shadow-lg whitespace-nowrap pointer-events-none"
        >
          {toastMsg}
        </div>
      )}

      {/* First-launch consent gate */}
      {!consentGiven && <ConsentModal onAgree={() => setConsentGiven(true)} />}
    </div>
  );
}
