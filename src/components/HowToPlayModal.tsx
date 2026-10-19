import React from 'react';
import { X, Plane, ArrowDownCircle, ShieldCheck, Zap } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'am';
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-neutral-950 border-b border-neutral-800 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-orange-400" />
            <h3 className="font-extrabold text-white text-base">
              {language === 'am' ? 'የሳፋሪ አቪዬተር አጨዋወት መመሪያ' : 'How to Play Safari Game Aviator'}
            </h3>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {language === 'am' ? (
            <div className="space-y-4 text-neutral-300 leading-relaxed">
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <h4 className="font-bold text-white mb-0.5">ውርርድ ያስቀምጡ (Place Bet)</h4>
                  <p>አውሮፕላኑ ከመብረሩ በፊት የሚወራረዱትን የብር መጠን ይምረጡና "BET" የሚለውን ይጫኑ። ሁለት የተለያዩ ፓነሎች በመጠቀም በአንድ ጊዜ 2 ውርርድ ማድረግ ይችላሉ።</p>
                </div>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <h4 className="font-bold text-white mb-0.5">የማባዣውን (Multiplier) ዕድገት ይከታተሉ</h4>
                  <p>አውሮፕላኑ መብረር ሲጀምር ማባዣው ከ1.00x ጀምሮ ወደ ላይ ይጨምራል (ለምሳሌ 2.0x, 5.0x, 20x, 100x+)!</p>
                </div>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <h4 className="font-bold text-white mb-0.5">አውሮፕላኑ ሳያመልጥ ገንዘብዎን ያውጡ (Cash Out)</h4>
                  <p>አውሮፕላኑ ከመብረሩ/ከመከስከሱ በፊት "CASH OUT" የሚለውን ይጫኑና ያሸነፉትን ገንዘብ ይውሰዱ! ካላወጡ ውርርድዎ ይበላሻል።</p>
                </div>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0">4</span>
                <div>
                  <h4 className="font-bold text-white mb-0.5">ራስ-ሰር ማውጫ (Auto Cash Out)</h4>
                  <p>የተወሰነ ማባዣ (ለምሳሌ 2.00x) አስቀምጠው አውሮፕላኑ እዛ ሲደርስ በራሱ እንዲያወጣ ማድረግ ይችላሉ።</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-neutral-300 leading-relaxed">
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <h4 className="font-bold text-white mb-0.5">1. Place Your Wager</h4>
                  <p>Select your bet amount using the quick chips or stepper before the round begins, then click <strong>BET</strong>. You can place two independent bets at once using Bet Panel 1 & 2!</p>
                </div>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <h4 className="font-bold text-white mb-0.5">2. Watch the Safari Plane Take Off</h4>
                  <p>The multiplier climbs starting from 1.00x and scales exponentially into the clouds (2x, 5x, 25x, 100x+)!</p>
                </div>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <h4 className="font-bold text-white mb-0.5">3. Cash Out Before it Flees!</h4>
                  <p>Hit the large green <strong>CASH OUT</strong> button at any moment to lock in your profit (Your Bet × Multiplier). If the plane flees before you cash out, the bet is lost.</p>
                </div>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0">4</span>
                <div>
                  <h4 className="font-bold text-white mb-0.5">4. Auto Cash Out Strategy</h4>
                  <p>Switch to the <strong>AUTO</strong> tab to set an automated cash out target (e.g. 1.50x or 2.00x) so you never miss a payout due to reaction time.</p>
                </div>
              </div>
            </div>
          )}

          <div className="p-3 bg-orange-950/30 border border-orange-500/30 rounded-xl text-orange-300">
            <strong>Deposit & Cashier:</strong> Deposit funds instantly via Telebirr (09.../07...), CBE Birr, Chapa, or Crypto. Switch between Real Wallet and Demo Practice mode at any time in the header!
          </div>
        </div>
      </div>
    </div>
  );
};
