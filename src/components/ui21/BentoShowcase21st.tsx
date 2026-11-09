import React from 'react';
import { Mic2, Radio, Instagram, Award, ArrowUpRight, Sparkles, ShieldCheck, Music } from 'lucide-react';

/**
 * 21st.dev Component Adaptation:
 * Based on "Marketing Feature Bento" [id: 43172] by isaiahbjork
 * & "Bento Grid" [id: 622] by kokonutd
 */

interface BentoShowcase21stProps {
  onOpenVideo: () => void;
  onOpenRider: () => void;
}

export const BentoShowcase21st: React.FC<BentoShowcase21stProps> = ({
  onOpenVideo,
  onOpenRider,
}) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1A22] border border-[#F2A900]/30 text-xs text-[#F2A900] font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>21st.dev • Feature Bento Grid #43172 & #622</span>
        </div>
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#F5E6CC]">
          Анатомия живого звука Беслана
        </h2>
        <p className="text-sm text-[#8E8E9F]">
          Почему слушатели сохраняют треки с первых 15 секунд, а ивент-агентства бронируют состав
          под закрытые гала-ужины и фестивали.
        </p>
      </div>

      {/* 21st.dev Asymmetric Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Card 1: Span 7 — Live Vocal & Brass Telemetry */}
        <div className="md:col-span-7 group relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#16161F] via-[#101016] to-[#0B0B0E] border border-[#F5E6CC]/10 hover:border-[#F2A900]/60 transition-all duration-300 overflow-hidden shadow-xl flex flex-col justify-between">
          <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-[#F2A900]/10 blur-3xl group-hover:bg-[#F2A900]/20 transition-all" />

          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#F2A900]/15 border border-[#F2A900]/30 text-xs font-bold text-[#F2A900]">
              <Mic2 className="w-3.5 h-3.5" />
              <span>Вокальный диапазон & Live Band</span>
            </div>
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-[#F5E6CC]">
              100% живой тенор и медная духовая секция без фонограмм
            </h3>
            <p className="text-sm text-[#8E8E9F] leading-relaxed max-w-xl">
              В эпоху пластикового автотюна Беслан возвращает на сцену честный бархатный нео-соул,
              фанковую ритм-секцию и кавказскую харизму. Каждое выступление — это живая
              импровизация.
            </p>
          </div>

          {/* Interactive Working Visual inside Bento (21st.dev #43172 pattern) */}
          <div className="mt-6 pt-5 border-t border-[#F5E6CC]/10 grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
            <div className="p-3 rounded-2xl bg-[#0B0B0E]/80 border border-[#F5E6CC]/10">
              <div className="text-[10px] font-mono text-[#8E8E9F]">ВОКАЛ</div>
              <div className="font-display font-extrabold text-lg text-[#F2A900] mt-0.5">
                3.5 Октавы
              </div>
              <div className="text-[11px] text-[#F5E6CC]/70">Лирико-драм. тенор</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#0B0B0E]/80 border border-[#F5E6CC]/10">
              <div className="text-[10px] font-mono text-[#8E8E9F]">РЕЗИДЕНЦИЯ</div>
              <div className="font-display font-extrabold text-lg text-[#FF7700] mt-0.5">
                «16 Тонн»
              </div>
              <div className="text-[11px] text-[#F5E6CC]/70">Москва, Арбат / Полярный</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#0B0B0E]/80 border border-[#F5E6CC]/10">
              <div className="text-[10px] font-mono text-[#8E8E9F]">ФОРМАТЫ</div>
              <div className="font-display font-extrabold text-lg text-[#10B981] mt-0.5">
                2 → 10 чел.
              </div>
              <div className="text-[11px] text-[#F5E6CC]/70">От дуэта до биг-бэнда</div>
            </div>
          </div>
        </div>

        {/* Card 2: Span 5 — Instagram @besikraev Live Reel Card */}
        <div className="md:col-span-5 group relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#1A1714] to-[#0B0B0E] border border-[#F2A900]/30 hover:border-[#F2A900] transition-all duration-300 overflow-hidden shadow-xl flex flex-col justify-between">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="./assets/beslan_avatar.jpg"
                alt="@besikraev"
                className="w-12 h-12 rounded-2xl object-cover border-2 border-[#F2A900]"
              />
              <div>
                <div className="font-display font-bold text-base text-[#F5E6CC]">@besikraev</div>
                <div className="text-xs text-[#F2A900] font-mono">Instagram Official • Reels</div>
              </div>
            </div>
            <a
              href="https://www.instagram.com/besikraev/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-[#1A1A22] text-[#F5E6CC] hover:bg-[#F2A900] hover:text-[#0B0B0E] transition-colors"
              title="Открыть Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>

          <div className="my-5 relative rounded-2xl overflow-hidden border border-[#F5E6CC]/15 h-40 group/video cursor-pointer" onClick={onOpenVideo}>
            <img
              src="./assets/beslan_poster.jpg"
              alt="Останься музыка клип"
              className="w-full h-full object-cover group-hover/video:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0E] via-[#0B0B0E]/40 to-transparent flex items-center justify-center">
              <span className="px-4 py-2 rounded-full bg-[#F2A900] text-[#0B0B0E] font-extrabold text-xs uppercase tracking-wider shadow-lg">
                ▶ Смотреть вертикальный Reel
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#8E8E9F]">
            <span>Трек: «Останься музыка» (Live Studio)</span>
            <a
              href="https://www.instagram.com/reel/DcQU8MDAMpV/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F2A900] font-bold inline-flex items-center gap-1 hover:underline"
            >
              <span>Оригинал в IG</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Card 3: Span 4 — Cultural Roots & Neo-Soul */}
        <div className="md:col-span-4 rounded-3xl p-6 bg-[#121218]/90 border border-[#F5E6CC]/10 hover:border-[#F2A900]/50 transition-all flex flex-col justify-between gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#F2A900]/15 border border-[#F2A900]/30 flex items-center justify-center text-[#F2A900]">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-lg text-[#F5E6CC]">
              Кавказский нео-соул & фанк
            </h4>
            <p className="text-xs text-[#8E8E9F] mt-1 leading-relaxed">
              Авторские композиции на русском и кабардино-черкесском языках («Останься музыка»,
              «Макъ», «Тенджыз») в современном фанк-звучании.
            </p>
          </div>
        </div>

        {/* Card 4: Span 4 — Soundcheck & Tech Rider */}
        <div className="md:col-span-4 rounded-3xl p-6 bg-[#121218]/90 border border-[#F5E6CC]/10 hover:border-[#F2A900]/50 transition-all flex flex-col justify-between gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#FF7700]/15 border border-[#FF7700]/30 flex items-center justify-center text-[#FF7700]">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-lg text-[#F5E6CC]">
              Прозрачный техрайдер
            </h4>
            <p className="text-xs text-[#8E8E9F] mt-1 leading-relaxed">
              Shure KSM9 / Beta 58A, In-Ear мониторинг Sennheiser G4, цифровой микшер M32/SQ5.
              Открывается без VPN и облачных дисков.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenRider}
            className="text-left text-xs font-bold text-[#F2A900] hover:underline inline-flex items-center gap-1"
          >
            <span>Открыть спецификацию FOH</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 5: Span 4 — Turnkey Contract Guarantee */}
        <div className="md:col-span-4 rounded-3xl p-6 bg-[#121218]/90 border border-[#F5E6CC]/10 hover:border-[#F2A900]/50 transition-all flex flex-col justify-between gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-lg text-[#F5E6CC]">
              Прямой контакт без посредников
            </h4>
            <p className="text-xs text-[#8E8E9F] mt-1 leading-relaxed">
              Расчёт гонорара и предоплаты 50% за 30 секунд. Заявка уходит напрямую менеджменту
              Беслана в Telegram `@besik_raev`.
            </p>
          </div>
          <a
            href="#booking"
            className="text-xs font-bold text-[#10B981] hover:underline inline-flex items-center gap-1"
          >
            <span>Перейти к калькулятору</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
};
