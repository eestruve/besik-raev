import React from 'react';
import { Calendar, MapPin, Ticket, ExternalLink, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { ConcertEvent } from '../types';

export const OFFICIAL_CONCERTS: ConcertEvent[] = [
  {
    id: 'puteshestvie-v-detstvo-moscow',
    title: 'Музыкально-поэтическая программа «Путешествие в детство»',
    subtitle: 'Большой сольный концерт Беслана (Besik Raev) с живым составом музыкантов',
    date: '2026-11-28',
    time: '19:00',
    venue: 'КДЦ «Полярный» (Большой зрительный зал)',
    city: 'Москва',
    address: 'ул. Полярная, д. 9 (м. Медведково / Бабушкинская)',
    ticketUrl: 'https://moscow.qtickets.events/242585-puteshestvie-v-detstvo',
    isSoldOut: false,
  },
];

export const ConcertsSection: React.FC = () => {
  return (
    <section id="concerts" className="space-y-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1A22] border border-[#FF7700]/30 text-xs text-[#FF7700] font-semibold">
          <Calendar className="w-3.5 h-3.5 text-[#FF7700]" />
          <span>Концертная афиша 2026</span>
        </div>
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#F5E6CC]">
          Живые выступления и концерты
        </h2>
        <p className="text-sm text-[#8E8E9F] leading-relaxed">
          Уникальное музыкально-поэтическое путешествие. Живой голос Беслана, авторские песни,
          ностальгия и неповторимая атмосфера искренности.
        </p>
      </div>

      {/* Featured Concert Card */}
      <div className="max-w-5xl mx-auto">
        {OFFICIAL_CONCERTS.map((concert) => (
          <div
            key={concert.id}
            className="glass-panel-gold rounded-3xl p-6 sm:p-10 border border-[#F2A900]/40 relative overflow-hidden shadow-2xl"
          >
            {/* Top ambient badge & lights */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#F2A900]/10 via-[#FF7700]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              {/* Left Column: Date & Venue details */}
              <div className="lg:col-span-8 space-y-5">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="px-3 py-1 rounded-full bg-[#E11D48]/15 border border-[#E11D48]/40 text-xs text-[#E11D48] font-bold tracking-wide uppercase flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-ping" />
                    Главный сольный концерт
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-xs text-[#10B981] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Билеты в продаже
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-gradient-gold tracking-tight leading-snug">
                    {concert.title}
                  </h3>
                  <p className="text-sm text-[#F5E6CC]/80 mt-2 leading-relaxed">
                    {concert.subtitle}
                  </p>
                </div>

                {/* Event Metadata grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-start gap-3 bg-[#0B0B0E]/50 p-3.5 rounded-2xl border border-[#F5E6CC]/10">
                    <div className="w-9 h-9 rounded-xl bg-[#1A1A22] border border-[#F2A900]/30 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-[#F2A900]" />
                    </div>
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-[#8E8E9F] font-bold block">
                        Дата и время
                      </span>
                      <span className="text-sm font-bold text-[#F5E6CC]">
                        28 ноября 2026 • 19:00
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-[#0B0B0E]/50 p-3.5 rounded-2xl border border-[#F5E6CC]/10">
                    <div className="w-9 h-9 rounded-xl bg-[#1A1A22] border border-[#FF7700]/30 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-[#FF7700]" />
                    </div>
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-[#8E8E9F] font-bold block">
                        Площадка и город
                      </span>
                      <span className="text-sm font-bold text-[#F5E6CC] block">
                        {concert.venue}
                      </span>
                      <span className="text-xs text-[#8E8E9F]">{concert.address}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: CTA & Ticket Purchase */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center gap-4 bg-[#121217]/70 p-6 rounded-2xl border border-[#F2A900]/20 shadow-xl">
                <div className="text-center space-y-1">
                  <span className="text-xs text-[#8E8E9F] uppercase tracking-widest font-semibold">
                    Официальный билетный оператор
                  </span>
                  <div className="font-display font-extrabold text-xl text-[#F2A900]">
                    Qtickets
                  </div>
                  <p className="text-[11px] text-[#8E8E9F]">
                    Быстрая и безопасная покупка без комиссии
                  </p>
                </div>

                <a
                  href={concert.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#F2A900] to-[#FF7700] text-[#0B0B0E] font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-[#F2A900]/25 hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  <Ticket className="w-4 h-4 fill-current" />
                  <span>Купить билет онлайн</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <div className="text-center text-[10px] text-[#8E8E9F]">
                  Электронный билет приходит на email сразу после оплаты
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
