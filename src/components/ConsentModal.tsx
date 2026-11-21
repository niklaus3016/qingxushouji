import { useEffect, useState, type ReactNode } from 'react';
import { Lock, ShieldCheck, X } from 'lucide-react';

const CONSENT_KEY = 'qingxu_privacy_agreed_v1';
const CONSENT_VERSION = '1.0.0';

/** Whether the user has already accepted the current version of the legal docs. */
export function hasAgreedConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === CONSENT_VERSION;
  } catch {
    return false;
  }
}

function saveConsent(): void {
  try {
    localStorage.setItem(CONSENT_KEY, CONSENT_VERSION);
  } catch {
    // Storage may be unavailable (private mode); consent still applies to this session.
  }
}

interface ConsentModalProps {
  onAgree: () => void;
}

type DocKey = 'agreement' | 'privacy' | null;

export function ConsentModal({ onAgree }: ConsentModalProps) {
  const [doc, setDoc] = useState<DocKey>(null);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [declined, setDeclined] = useState(false);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const handleAgree = () => {
    saveConsent();
    onAgree();
  };

  if (declined) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center px-8 bg-[#F7F6F2] dark:bg-[#141717] text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#EAF1F0] dark:bg-[#24302F] text-[#5E8C88] dark:text-[#86B6B2] flex items-center justify-center mb-5">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-semibold text-[#252C2B] dark:text-[#EEF2F1]">
          未同意协议
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[#5A6462] dark:text-[#A3AEAC]">
          你已拒绝《用户服务协议》与《隐私政策》，暂时无法使用「情序手记」。
        </p>
        <p className="mt-1.5 text-xs text-[#7B8583] dark:text-[#8C9795]">
          如需退出，可直接关闭应用。
        </p>
        <button
          type="button"
          onClick={() => setDeclined(false)}
          className="mt-6 min-h-[46px] px-6 rounded-2xl bg-[#5E8C88] hover:bg-[#4F7B77] dark:bg-[#6A9B97] dark:hover:bg-[#78AAA6] text-white dark:text-[#111515] text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5E8C88]"
        >
          重新阅读协议
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-title"
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      >
        <div className="w-full max-w-sm max-h-[85dvh] flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-[#1D2121] border border-[#E5E7E4] dark:border-[#2A3030] shadow-xl">
          <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF1F0] dark:bg-[#24302F] text-[#5E8C88] dark:text-[#86B6B2] flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h2
              id="consent-title"
              className="text-lg font-semibold text-center text-[#252C2B] dark:text-[#EEF2F1]"
            >
              用户协议与隐私政策
            </h2>

            <p className="mt-2.5 text-sm leading-relaxed text-[#5A6462] dark:text-[#A3AEAC]">
              欢迎使用「情序手记」。开始记录前，请阅读并同意以下内容：
            </p>

            <ul className="mt-3 space-y-2 rounded-2xl bg-[#F7F6F2] dark:bg-[#161A1A] px-4 py-3.5 text-sm leading-relaxed text-[#4E5856] dark:text-[#B4BFBD]">
              <li>
                <span className="font-medium text-[#252C2B] dark:text-[#EEF2F1]">(1) </span>
                《隐私政策》中关于本地数据存储、系统权限使用与个人信息保护的说明。
              </li>
              <li>
                <span className="font-medium text-[#252C2B] dark:text-[#EEF2F1]">(2) </span>
                《用户服务协议》中关于服务内容、免责声明与知识产权归属的说明。
              </li>
            </ul>

            <p className="mt-4 text-sm leading-relaxed text-[#5A6462] dark:text-[#A3AEAC]">
              请阅读完整的
              <button
                type="button"
                onClick={() => setDoc('agreement')}
                className="mx-1 font-medium text-[#5E8C88] dark:text-[#86B6B2] underline underline-offset-2"
              >
                《用户服务协议》
              </button>
              和
              <button
                type="button"
                onClick={() => setDoc('privacy')}
                className="mx-1 font-medium text-[#5E8C88] dark:text-[#86B6B2] underline underline-offset-2"
              >
                《隐私政策》
              </button>
              ，了解详细内容。
            </p>

            <p className="mt-4 text-xs leading-relaxed text-[#7B8583] dark:text-[#8C9795]">
              本应用为本地情绪手记工具，无需注册登录，你的手记仅保存在当前设备。
            </p>
          </div>

          <div className="shrink-0 border-t border-black/[0.06] dark:border-white/[0.07] p-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowDeclineConfirm(true)}
              className="flex-1 min-h-[46px] rounded-2xl border border-black/[0.1] dark:border-white/[0.12] text-sm font-medium text-[#4C5654] dark:text-[#CBD3D1] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
            >
              不同意
            </button>
            <button
              type="button"
              onClick={handleAgree}
              className="flex-1 min-h-[46px] rounded-2xl bg-[#5E8C88] hover:bg-[#4F7B77] dark:bg-[#6A9B97] dark:hover:bg-[#78AAA6] text-white dark:text-[#111515] text-sm font-semibold transition-colors"
            >
              同意并继续
            </button>
          </div>
        </div>
      </div>

      {doc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-doc-title"
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg h-[85dvh] flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-[#1D2121] border border-[#E5E7E4] dark:border-[#2A3030] shadow-xl">
            <div className="shrink-0 flex items-center gap-3 px-4 py-3.5 border-b border-black/[0.06] dark:border-white/[0.07]">
              <div className="w-9 h-9 rounded-xl bg-[#EAF1F0] dark:bg-[#24302F] text-[#5E8C88] dark:text-[#86B6B2] flex items-center justify-center">
                <ShieldCheck className="w-[18px] h-[18px]" />
              </div>
              <h2
                id="legal-doc-title"
                className="flex-1 text-base font-semibold text-[#252C2B] dark:text-[#EEF2F1]"
              >
                {doc === 'privacy' ? '隐私政策' : '用户服务协议'}
              </h2>
              <button
                type="button"
                onClick={() => setDoc(null)}
                aria-label="关闭"
                className="min-w-[40px] min-h-[40px] -mr-1 flex items-center justify-center rounded-xl text-[#7B8583] hover:text-[#252C2B] dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#F7F6F2] dark:bg-[#161A1A] px-5 py-5">
              {doc === 'privacy' ? <PrivacyPolicyContent /> : <UserAgreementContent />}
            </div>

            <div className="shrink-0 px-4 py-3 border-t border-black/[0.06] dark:border-white/[0.07]">
              <button
                type="button"
                onClick={() => setDoc(null)}
                className="w-full min-h-[44px] rounded-2xl bg-[#5E8C88] hover:bg-[#4F7B77] dark:bg-[#6A9B97] dark:hover:bg-[#78AAA6] text-white dark:text-[#111515] text-sm font-semibold transition-colors"
              >
                我已阅读
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeclineConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#1D2121] border border-[#E5E7E4] dark:border-[#2A3030] p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-semibold text-[#252C2B] dark:text-[#EEF2F1]">
              确认拒绝
            </h3>
            <p className="text-sm leading-relaxed text-[#5A6462] dark:text-[#A3AEAC]">
              确定拒绝用户协议与隐私政策吗？拒绝后将无法使用「情序手记」的任何记录功能。
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowDeclineConfirm(false)}
                className="flex-1 min-h-[44px] rounded-2xl border border-black/[0.1] dark:border-white/[0.12] text-sm font-medium text-[#4C5654] dark:text-[#CBD3D1]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeclineConfirm(false);
                  setDeclined(true);
                }}
                className="flex-1 min-h-[44px] rounded-2xl bg-[#C26A60] text-white text-sm font-semibold"
              >
                确定拒绝
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="mb-2 text-sm font-semibold text-[#252C2B] dark:text-[#EEF2F1]">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-[#4E5856] dark:text-[#B4BFBD]">
        {children}
      </div>
    </section>
  );
}

export function PrivacyPolicyContent({ showTitle = true }: { showTitle?: boolean }) {
  return (
    <div>
      {showTitle && (
        <h1 className="text-center text-lg font-semibold text-[#252C2B] dark:text-[#EEF2F1]">
          隐私政策
        </h1>
      )}
      <p className="mt-1 text-center text-xs text-[#7B8583] dark:text-[#8C9795]">
        生效日期：2026年11月21日
      </p>

      <div className="mt-4 rounded-2xl border border-[#DCE7E5] dark:border-[#2A3634] bg-[#EFF5F4] dark:bg-[#1C2625] p-4 text-sm leading-relaxed text-[#4E5856] dark:text-[#B4BFBD]">
        欢迎使用「情序手记」（以下简称“本应用”）。本应用由
        <strong className="font-semibold text-[#3D4645] dark:text-[#CBD3D1]">
          光年跃迁（温州）科技有限公司
        </strong>
        （以下简称“我们”）开发并运营。我们深知个人信息对你的重要性，将严格遵守《中华人民共和国个人信息保护法》等相关法律法规，保护你的个人信息安全。
      </div>

      <p className="mt-4 text-sm leading-relaxed text-[#4E5856] dark:text-[#B4BFBD]">
        本政策旨在说明本应用如何处理你在使用过程中产生的信息，以及你享有的权利。请在使用本应用前仔细阅读并充分理解本政策的全部内容。如你对本政策有任何疑问，可通过文末的联系方式与我们联系。
      </p>

      <Section title="一、我们收集的信息">
        <p>
          本应用是本地情绪手记工具，不提供账号注册与登录，也不接入任何第三方 SDK。我们不会以任何形式收集、读取或上传你的个人身份信息。
        </p>
        <p>
          你在应用内主动记录的情绪状态、情绪评分、手记正文、标签、贴纸与记录日期，以及主题、提醒、常用标签等偏好设置，全部仅保存在当前设备的本地存储（IndexedDB /
          localStorage）中。
        </p>
        <p>
          我们不收集设备型号、操作系统版本、设备标识符（如 IMEI / Android ID）、IP
          地址、位置信息、通讯录、相册或麦克风等任何设备与敏感信息。
        </p>
      </Section>

      <Section title="二、我们如何使用这些信息">
        <p>
          上述本地数据仅用于在你当前设备上实现手记记录、日历回溯、情绪统计与主题展示等核心功能。
        </p>
        <p>
          我们不将任何数据用于用户画像或行为分析，也不会将数据上传至服务器或提供给任何第三方。
        </p>
      </Section>

      <Section title="三、我们如何共享、转让和公开披露信息">
        <p>本应用不包含第三方 SDK，也不存在与合作伙伴共享数据的情形。</p>
        <p>
          仅在法律法规规定，或行政、司法机关依法提出强制性要求时，我们才可能依法配合；但如前所述，本应用并不持有你的手记数据。
        </p>
        <p>
          应用商店等分发平台可能会依据其自身隐私政策处理下载、更新等平台侧信息，该等处理与我们无关。
        </p>
      </Section>

      <Section title="四、信息存储与安全">
        <p>你的手记与偏好设置仅存储在当前设备本地，不进行云端同步，也不提供账号备份。</p>
        <p>
          卸载本应用、在系统设置中清除应用数据，或设备损坏、丢失、更换，都会导致本地数据被删除且无法找回，我们无法为你恢复。
        </p>
      </Section>

      <Section title="五、你的权利">
        <p>
          <strong className="font-semibold text-[#3D4645] dark:text-[#CBD3D1]">访问与更正：</strong>
          你可以随时在首页与手记日历中查看、编辑你的手记。
        </p>
        <p>
          <strong className="font-semibold text-[#3D4645] dark:text-[#CBD3D1]">删除：</strong>
          你可以删除单条手记，或在设置中使用“一键清空全部手记”删除全部本地数据。
        </p>
        <p>
          <strong className="font-semibold text-[#3D4645] dark:text-[#CBD3D1]">撤回同意：</strong>
          你可以停止使用本应用并卸载，以终止数据在本机的保存。
        </p>
        <p>
          <strong className="font-semibold text-[#3D4645] dark:text-[#CBD3D1]">数据导出：</strong>
          当前版本未提供导出功能，数据仅保存在本机。
        </p>
      </Section>

      <Section title="六、未成年人保护">
        <p>
          本应用面向一般用户。若你是未满 14
          周岁的未成年人，请在监护人指导下阅读本政策，并在取得监护人同意后使用。
        </p>
        <p>
          若我们发现未经监护人同意收集了未成年人信息，将及时删除；由于数据仅存于本机，监护人也可直接在本机删除相关记录或卸载应用。
        </p>
      </Section>

      <Section title="七、本政策的更新">
        <p>
          我们可能根据法律法规或产品调整更新本政策。更新后的政策会随应用版本内置在本页面，并在版本更新时提示你重新阅读。若你继续使用本应用，即表示你接受更新后的政策。
        </p>
      </Section>

      <Section title="八、联系我们">
        <p>如你对本政策有任何疑问、意见或建议，可通过以下方式联系我们：</p>
        <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#1D2121] p-4">
          <p>
            <strong className="font-semibold text-[#3D4645] dark:text-[#CBD3D1]">开发与运营：</strong>
            光年跃迁（温州）科技有限公司
          </p>
          <p>
            <strong className="font-semibold text-[#3D4645] dark:text-[#CBD3D1]">电子邮箱：</strong>
            Jp112022@163.com
          </p>
        </div>
      </Section>

      <p className="mt-8 border-t border-black/[0.06] dark:border-white/[0.08] pt-5 text-center text-xs text-[#7B8583] dark:text-[#8C9795]">
        感谢你使用「情序手记」。
        <br />© 2026 光年跃迁（温州）科技有限公司 版权所有
      </p>
    </div>
  );
}

function UserAgreementContent() {
  return (
    <div>
      <h1 className="text-center text-lg font-semibold text-[#252C2B] dark:text-[#EEF2F1]">
        用户服务协议
      </h1>
      <p className="mt-1 text-center text-xs text-[#7B8583] dark:text-[#8C9795]">
        更新日期：2026年11月21日
      </p>

      <Section title="1. 协议的接受">
        <p>
          欢迎使用「情序手记」（以下简称“本应用”）。本协议是你与光年跃迁（温州）科技有限公司（以下简称“我们”）之间关于使用本应用的法律协议。
        </p>
        <p>
          通过下载、安装、点击“同意并继续”或使用本应用，即表示你已阅读并同意本协议的全部条款。
        </p>
      </Section>

      <Section title="2. 服务内容">
        <p>本应用提供以下本地功能：</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>记录情绪状态、情绪评分、手记正文、标签与贴纸；</li>
          <li>通过日历回溯历史手记，并进行情绪统计与复盘；</li>
          <li>自定义深浅色主题、常用标签与提醒偏好。</li>
        </ul>
        <p>本应用不提供账号、云端同步、社交互动或在线内容服务。</p>
      </Section>

      <Section title="3. 用户义务">
        <p>作为本应用的用户，你同意：</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>遵守本协议及适用法律法规，不利用本应用从事任何违法活动；</li>
          <li>妥善保管设备与系统锁屏密码，避免他人未经授权查看你的手记；</li>
          <li>不逆向工程、破解、干扰或破坏本应用的正常运行；</li>
          <li>
            理解本应用数据仅存于本机，自行承担因卸载、清除数据、设备损坏等导致数据丢失的风险。
          </li>
        </ul>
      </Section>

      <Section title="4. 知识产权">
        <p>
          本应用的界面设计、图标、文案与程序代码等知识产权归我们或相关权利人所有。未经书面许可，你不得复制、修改、分发或用于商业用途。
        </p>
        <p>你在本应用中记录的手记内容归你所有，我们不会读取或使用。</p>
      </Section>

      <Section title="5. 免责声明">
        <p>本应用按“原样”提供。我们不保证本应用完全无错误、不中断或满足你的全部预期。</p>
        <p>
          本应用的情绪统计、图表与模板化文字仅基于你本机记录做简单运算，仅供自我回顾参考，不构成心理测评、心理咨询、医疗诊断或治疗建议。若你长期情绪低落或出现心理不适，请及时寻求专业心理咨询师或正规医疗机构的帮助。
        </p>
        <p>因设备故障、系统清理、误删、卸载等原因造成的数据丢失，我们不承担恢复责任。</p>
      </Section>

      <Section title="6. 服务变更与终止">
        <p>
          我们可能因版本升级、法律法规要求或业务调整而更新、暂停或终止部分功能，更新内容将随应用版本发布。
        </p>
        <p>你可以随时停止使用本应用并卸载。若你不同意本协议或隐私政策，请勿使用本应用。</p>
      </Section>

      <Section title="7. 适用法律与争议解决">
        <p>
          本协议受中华人民共和国法律管辖。因本协议产生的争议，双方应友好协商解决；协商不成的，可提交至温州市有管辖权的人民法院诉讼解决。
        </p>
      </Section>

      <Section title="8. 联系我们">
        <p>如你对本协议有任何疑问、意见或建议，可通过以下方式联系我们：</p>
        <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#1D2121] p-4">
          <p>
            <strong className="font-semibold text-[#3D4645] dark:text-[#CBD3D1]">开发与运营：</strong>
            光年跃迁（温州）科技有限公司
          </p>
          <p>
            <strong className="font-semibold text-[#3D4645] dark:text-[#CBD3D1]">电子邮箱：</strong>
            Jp112022@163.com
          </p>
        </div>
      </Section>

      <p className="mt-8 border-t border-black/[0.06] dark:border-white/[0.08] pt-5 text-center text-xs text-[#7B8583] dark:text-[#8C9795]">
        © 2026 光年跃迁（温州）科技有限公司 版权所有
      </p>
    </div>
  );
}
