import React, { useEffect, useState } from 'react';
import { X, Printer, Copy, Check, FileText, CheckCircle2, Mic, Music, Coffee } from 'lucide-react';
import { TechRiderSection } from '../types';

interface TechRiderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TECH_RIDER_SECTIONS: TechRiderSection[] = [
  {
    title: 'Звуковое оборудование и микрофонный парк (FOH & Sound)',
    iconName: 'mic',
    items: [
      'Микрофон вокалиста: Shure KSM9 / Beta 58A / Sennheiser e945 (радиосистема с чистым радиодиапазоном)',
      'Мониторинг: 2 напольных монитора (не менее 12", 400W) или стереопара In-Ear Sennheiser G4 (по согласованию)',
      'Линейные стереовходы: 2x DI-Box активные (BSS / Radial) для плейбека и клавишных линий',
      'FOH-пульт: Профессиональный цифровой микшер (Midas M32, Behringer X32, Allen&Heath SQ5) с возможностью раздельного эквалайзера и компрессии',
      'Саундчек: Минимум 45 минут чистого времени до запуска зрителей в зал',
    ],
  },
  {
    title: 'Сцена и бэклайн (Stage & Backline)',
    iconName: 'music',
    items: [
      'Клавишная стойка: Усиленная X-образная или Z-образная стойка для сценического пианино',
      'Стойка под микрофон: Тяжелая прямая стойка с круглым основанием или усиленный журавль (K&M)',
      'Электропитание: 4 независимые розетки 220V на сцене, стабилизированная отдельная фаза от световых приборов',
      'Сценический свет: Тёплый ламповый заливной свет (3200K amber/gold), фронтальный софит на вокалиста, отсутствие слепящих стробоскопов',
    ],
  },
  {
    title: 'Бытовой райдер и гримерная (Hospitality Rider)',
    iconName: 'coffee',
    items: [
      'Гримерная комната: Чистая, отапливаемая, запираемая на ключ, с зеркалом в полный рост и отпаривателем для одежды',
      'Напитки: Негазированная питьевая вода комнатной температуры (6 бутылок по 0.5л, стекло или качественный пластик)',
      'Горячие напитки: Свежезаваренный чай (черный/зеленый), натуральный кофе, свежий лимон, натуральный мёд',
      'Питание: Тарелка со свежими фруктами (яблоки, бананы, виноград), легкие закуски; горячее питание при занятости команды > 3 часов',
      'Безопасность: Охрана гримерной зоны и контроль доступа посторонних лиц на сцену',
    ],
  },
];

export const TechRiderModal: React.FC<TechRiderModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const fullText = [
      'ТЕХНИЧЕСКИЙ И БЫТОВОЙ РАЙДЕР АРТИСТА БЕСЛАНА (BESIK RAEV)',
      'Версия: 2026 | Контакты директора: @besik_raev',
      '-------------------------------------------------------',
      ...TECH_RIDER_SECTIONS.flatMap((sec) => [
        `\n[${sec.title}]`,
        ...sec.items.map((item, idx) => `${idx + 1}. ${item}`),
      ]),
    ].join('\n');

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tech-rider-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0B0E]/90 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <div className="glass-panel-gold rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-[#F2A900]/40 shadow-2xl overflow-hidden relative">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#F5E6CC]/10 flex items-center justify-between bg-[#121217]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F2A900] to-[#FF7700] p-0.5 flex items-center justify-center">
              <div className="w-full h-full rounded-[10px] bg-[#0B0B0E] flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#F2A900]" />
              </div>
            </div>
            <div>
              <h3 id="tech-rider-title" className="font-display font-bold text-lg sm:text-xl text-[#F5E6CC]">
                Технический и бытовой райдер
              </h3>
              <p className="text-xs text-[#8E8E9F]">Besik Raev (Беслан) • Сезон 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#1A1A22] border border-[#F5E6CC]/15 text-xs font-semibold text-[#F5E6CC] hover:text-[#F2A900] hover:border-[#F2A900]/40 transition-colors flex items-center gap-1.5"
              title="Печать райдера"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Печать</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#1A1A22] border border-[#F5E6CC]/15 text-xs font-semibold text-[#F5E6CC] hover:text-[#F2A900] hover:border-[#F2A900]/40 transition-colors flex items-center gap-1.5"
              title="Копировать в буфер"
            >
              {copied ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Скопировано!' : 'Копировать'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-[#1A1A22] border border-[#F5E6CC]/15 text-[#8E8E9F] hover:text-[#F5E6CC] hover:bg-[#1A1A22]/80 transition-colors"
              aria-label="Закрыть модальное окно"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin scrollbar-thumb-[#F2A900]/20">
          {TECH_RIDER_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-3">
              <div className="flex items-center gap-2.5">
                {section.iconName === 'mic' && <Mic className="w-4 h-4 text-[#F2A900]" />}
                {section.iconName === 'music' && <Music className="w-4 h-4 text-[#FF7700]" />}
                {section.iconName === 'coffee' && <Coffee className="w-4 h-4 text-[#F2A900]" />}
                <h4 className="font-display font-bold text-base text-[#FAF4EB]">
                  {section.title}
                </h4>
              </div>

              <div className="bg-[#0B0B0E]/60 rounded-2xl p-4 border border-[#F5E6CC]/10 space-y-2.5">
                {section.items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#F5E6CC]/90">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Contact note */}
          <div className="p-4 rounded-2xl bg-[#F2A900]/10 border border-[#F2A900]/30 text-xs text-[#F5E6CC]/90 flex items-center justify-between flex-wrap gap-2">
            <span>Вопросы по согласованию технического оборудования:</span>
            <a
              href="https://t.me/besik_raev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F2A900] font-bold hover:underline"
            >
              Telegram @besik_raev
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
