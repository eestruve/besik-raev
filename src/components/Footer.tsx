import React from 'react';
import { Instagram, Send, ExternalLink, Disc3, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onOpenBesroll?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenBesroll }) => {
  return (
    <footer className="relative mt-20 border-t border-[#F5E6CC]/10 bg-[#0B0B0E] text-[#8E8E9F] text-xs">
      {/* Decorative vinyl top edge */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F2A900]/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Artist Bio & Vision */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-display font-extrabold text-xl tracking-wider text-gradient-gold">
                BESIK RAEV
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#F2A900]/10 border border-[#F2A900]/30 text-[10px] text-[#F2A900] font-semibold">
                100% Живой звук
              </span>
            </div>
            <p className="text-sm text-[#8E8E9F] max-w-md leading-relaxed">
              Беслан Хазраилович Тлихураев — певец, музыкант, актёр мюзиклов. Авторский фанк,
              нео-соул и концертная программа «Путешествие в детство».
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://www.instagram.com/besikraev/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1A1A22] border border-[#F5E6CC]/10 text-[#F5E6CC] hover:text-[#F2A900] hover:border-[#F2A900]/40 transition-colors"
              >
                <Instagram className="w-4 h-4 text-[#FF7700]" />
                <span className="font-medium">@besikraev</span>
              </a>
              <a
                href="https://t.me/besik_raev"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1A1A22] border border-[#F5E6CC]/10 text-[#F5E6CC] hover:text-[#F2A900] hover:border-[#F2A900]/40 transition-colors"
              >
                <Send className="w-4 h-4 text-[#F2A900]" />
                <span className="font-medium">@besik_raev</span>
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#F5E6CC] font-bold">Навигация</h4>
            <ul className="space-y-2">
              <li>
                <a href="#player" className="hover:text-[#F2A900] transition-colors">
                  Виниловый плеер
                </a>
              </li>
              <li>
                <a href="#release" className="hover:text-[#F2A900] transition-colors">
                  Сингл «Останься музыка»
                </a>
              </li>
              <li>
                <a href="#concerts" className="hover:text-[#F2A900] transition-colors">
                  Афиша «Путешествие в детство»
                </a>
              </li>
              <li>
                <a href="#booking" className="hover:text-[#F2A900] transition-colors">
                  Калькулятор букинга и райдер
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Secret Besroll & Prank */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#F5E6CC] font-bold">Спецпроекты</h4>
            <p className="text-xs text-[#8E8E9F] leading-relaxed">
              Вирусный проект Бесроллинг — разыграй друзей стильной ссылкой-приманкой.
            </p>
            <button
              type="button"
              onClick={onOpenBesroll}
              className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-[#1A1A22] to-[#121217] border border-[#F2A900]/30 hover:border-[#F2A900] text-[#F5E6CC] text-xs font-semibold transition-all shadow-md hover:shadow-[#F2A900]/10"
            >
              <img
                src="./assets/kolobok_crazy.gif"
                alt="Бесролл"
                className="w-5 h-5 object-contain group-hover:scale-125 transition-transform"
              />
              <span className="group-hover:text-[#F2A900] transition-colors">Забесроллить друга</span>
            </button>
          </div>
        </div>

        {/* Bottom row: Copyright & 152-ФЗ compliance */}
        <div className="pt-8 border-t border-[#F5E6CC]/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#8E8E9F]">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Besik Raev (Беслан). Все права защищены.</span>
          </div>

          <div className="flex items-center gap-2 text-center sm:text-right">
            <ShieldCheck className="w-3.5 h-3.5 text-[#F2A900]" />
            <span>Соответствие 152-ФЗ РФ. Технические cookie не содержат персональных данных.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
