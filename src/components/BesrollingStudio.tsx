import React, { useState } from 'react';
import { X, Copy, Check, Send, Sparkles, Flame, ExternalLink, Play, RotateCcw } from 'lucide-react';
import { BesrollingPreset } from '../types';

export const BESROLLING_PRESETS: BesrollingPreset[] = [
  {
    id: 'vhs_1997',
    title: '📼 VHS Архив 1997 года (Школьная дискотека)',
    desc: 'Оцифрованная раритетная видеокассета с легендарной вечеринки 90-х',
    baitParam: 'vhs1997',
    badge: 'Ностальгия 90-х',
    kolobokIcon: './assets/kolobok_crazy.gif',
  },
  {
    id: 'sweets_90s',
    title: '🍬 Вкус детства 90-х (Сладости возвращаются)',
    desc: 'Официальный анонс возвращения легендарных жвачек Turbo, Love Is и напитков Yupi',
    baitParam: 'sweets90s',
    badge: 'Ретро-хит',
    kolobokIcon: './assets/kolobok_laugh.gif',
  },
  {
    id: 'dendy_sega',
    title: '🕹 Онлайн архив игр Dendy и Sega',
    desc: 'Браузерный эмулятор с полным каталогом игр детства без скачивания',
    baitParam: 'retrogame',
    badge: 'Гейминг',
    kolobokIcon: './assets/kolobok_dance.gif',
  },
  {
    id: 'gta_6_leak',
    title: '🎮 Слив 20 минут чистого геймплея GTA 6',
    desc: 'Свежая утечка реального геймплея в 4K 60FPS без водяных знаков',
    baitParam: 'gta6leak',
    badge: 'Хайп 2026',
    kolobokIcon: './assets/kolobok_crown.gif',
  },
  {
    id: 'tg_premium',
    title: '🎁 Халявная подписка Telegram Premium на год',
    desc: 'Промокод на активацию премиума в честь дня рождения мессенджера',
    baitParam: 'freegift',
    badge: 'Вирусная приманка',
    kolobokIcon: './assets/kolobok_crazy.gif',
  },
  {
    id: 'secret_track',
    title: '🎵 Секретный неизданный трек Беслана',
    desc: 'Эксклюзивная студийная демо-запись нового фанк-сингла до официальной премьеры',
    baitParam: 'secrettrack',
    badge: 'Эксклюзив',
    kolobokIcon: './assets/kolobok_dance.gif',
  },
];

interface BesrollingStudioProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BesrollingStudio: React.FC<BesrollingStudioProps> = ({ isOpen, onClose }) => {
  const [selectedPreset, setSelectedPreset] = useState<BesrollingPreset>(BESROLLING_PRESETS[0]);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isPreviewActive, setIsPreviewActive] = useState<boolean>(false);

  if (!isOpen) return null;

  const generatePrankUrl = () => {
    const baseUrl = 'https://besroll.ru';
    const params = new URLSearchParams({
      preset: selectedPreset.baitParam,
      ref: 'beslan_official',
    });
    if (customMessage.trim()) {
      params.set('t', customMessage.trim());
    }
    return `${baseUrl}/?${params.toString()}`;
  };

  const prankUrl = generatePrankUrl();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(prankUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToTelegram = () => {
    const text = customMessage.trim()
      ? `${customMessage.trim()}\n${prankUrl}`
      : `Смотри, что нашел: ${prankUrl}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(prankUrl)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareToWhatsApp = () => {
    const text = customMessage.trim()
      ? `${customMessage.trim()} ${prankUrl}`
      : `Глянь: ${prankUrl}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="besroll-studio-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0B0E]/90 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <div className="glass-panel-gold rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-[#F2A900]/50 shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-6 border-b border-[#F5E6CC]/10 flex items-center justify-between bg-[#121217]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F2A900] to-[#FF7700] p-0.5 flex items-center justify-center shadow-lg">
              <img
                src="./assets/kolobok_crazy.gif"
                alt="Besroll"
                className="w-7 h-7 object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="besroll-studio-title" className="font-display font-extrabold text-lg sm:text-xl text-gradient-gold">
                  Бесроллинг 2.0: Студия розыгрышей
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#FF7700]/20 text-[10px] text-[#FF7700] font-bold">
                  Easter Egg
                </span>
              </div>
              <p className="text-xs text-[#8E8E9F]">
                Сделай персональную ссылку-приманку и забесролль друзей треком «Останься музыка»!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1A1A22] border border-[#F5E6CC]/15 text-[#8E8E9F] hover:text-[#F5E6CC] hover:bg-[#1A1A22]/80 transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin scrollbar-thumb-[#F2A900]/20">
          {/* Preset Selector */}
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-wider font-bold text-[#F5E6CC] flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#FF7700]" />
              <span>Выберите тему приманки</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BESROLLING_PRESETS.map((preset) => {
                const isSelected = preset.id === selectedPreset.id;

                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      setSelectedPreset(preset);
                      setIsPreviewActive(false);
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-[#F2A900] bg-[#1A1A22] shadow-lg shadow-[#F2A900]/10'
                        : 'border-[#F5E6CC]/10 bg-[#121217]/50 hover:bg-[#1A1A22]/60'
                    }`}
                  >
                    <img
                      src={preset.kolobokIcon}
                      alt="Icon"
                      className="w-6 h-6 object-contain flex-shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-[#F5E6CC] truncate">
                          {preset.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8E8E9F] mt-1 line-clamp-2">
                        {preset.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Message Input */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-bold text-[#F5E6CC] block">
              Персональный текст для друга (необязательно)
            </label>
            <input
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Например: «Бро, помнишь эту игру?» или «Смотри, кого я нашел!»"
              className="w-full px-4 py-3 rounded-2xl bg-[#0B0B0E]/80 border border-[#F5E6CC]/15 text-xs sm:text-sm text-[#F5E6CC] placeholder-[#8E8E9F] focus:outline-none focus:border-[#F2A900] focus:ring-2 focus:ring-[#F2A900]"
            />
          </div>

          {/* Live Prank Link Box */}
          <div className="p-4 rounded-2xl bg-[#0B0B0E]/80 border border-[#F2A900]/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-[#8E8E9F] font-bold">
                Готовая ссылка-ловушка
              </span>
              <span className="text-[10px] text-[#10B981] font-mono font-semibold">
                100% срабатывание
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#121217] border border-[#F5E6CC]/10 text-xs font-mono text-[#F2A900] break-all select-all">
              {prankUrl}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#F2A900] to-[#FF7700] text-[#0B0B0E] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md hover:opacity-95 transition-opacity"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Скопировано!' : 'Скопировать ссылку'}</span>
              </button>

              <button
                type="button"
                onClick={shareToTelegram}
                className="py-2.5 px-4 rounded-xl bg-[#1A1A22] border border-[#F5E6CC]/15 hover:border-[#F2A900] text-[#F5E6CC] hover:text-[#F2A900] font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-[#F2A900]" />
                <span>Telegram</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPreviewActive(!isPreviewActive)}
                className="py-2.5 px-4 rounded-xl bg-[#1A1A22] border border-[#F5E6CC]/15 hover:border-[#FF7700] text-[#F5E6CC] hover:text-[#FF7700] font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isPreviewActive ? 'Скрыть тест' : 'Тест пранка'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Prank Preview Mode */}
          {isPreviewActive && (
            <div className="p-5 rounded-2xl bg-[#161622] border-2 border-dashed border-[#F2A900] text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-center gap-2">
                <img
                  src="./assets/kolobok_dance.gif"
                  alt="Dancing kolobok"
                  className="w-10 h-10 object-contain"
                />
                <h4 className="font-display font-bold text-lg text-[#F2A900]">
                  YOU JUST GOT BESLANED! 🕺
                </h4>
                <img
                  src="./assets/kolobok_crown.gif"
                  alt="Crown kolobok"
                  className="w-8 h-8 object-contain"
                />
              </div>

              <p className="text-xs text-[#FAF4EB] max-w-md mx-auto leading-relaxed">
                Вместо архива запускается взрывной фанк Беслана:
                <br />
                <span className="italic text-[#F2A900] font-semibold">
                  «Останься, музыка, в переулках ночных...»
                </span>
              </p>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPreviewActive(false)}
                  className="px-4 py-2 rounded-xl bg-[#1A1A22] text-xs font-semibold text-[#8E8E9F] hover:text-[#F5E6CC]"
                >
                  Закрыть предпросмотр
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
