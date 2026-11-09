import React, { useState, useMemo } from 'react';
import {
  BookingFormat,
  RegionZone,
  FormatOption,
  RegionOption,
  BookingAddons,
  BookingCalculation,
} from '../types';
import { calculateBookingCost } from '../utils/bookingCalculations';
import {
  Calculator,
  Users,
  MapPin,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';

export const FORMAT_OPTIONS: FormatOption[] = [
  {
    id: 'acoustic',
    name: 'Акустика & Лаунж',
    subtitle: 'Камерный дуэт / трио',
    duration: '2 сета по 30 мин или 45 мин',
    lineup: 'Беслан (вокал) + гитара/клавиши + перкуссия',
    basePrice: 150000,
    description: 'Идеально для велкам-зон, камерных ужинов, статусных презентаций и винных вечеров.',
    features: ['Живой вокал без фонограммы', 'Винтажный соул и кавер-баллады', 'Компактный райдер (минимум оборудования)'],
    badge: 'Камерный уют',
  },
  {
    id: 'club',
    name: 'Клубный драйв',
    subtitle: 'Club Show & Party Set',
    duration: '45–50 минут нон-стоп',
    lineup: 'Беслан (вокал) + DJ / плейбек + бэк-вокал',
    basePrice: 180000,
    description: 'Танцевальный взрывной фанк, плотный бас и грув для клубов, баров и модных вечеринок.',
    features: ['Энергичный танцевальный сет', 'Сингл «Останься музыка» в кульминации', 'Интерактив с танцполом'],
    badge: 'Хит танцполов',
  },
  {
    id: 'private',
    name: 'Частное событие / VIP',
    subtitle: 'Свадьба, юбилей, закрытый вечер',
    duration: '45–60 минут + общение',
    lineup: 'Беслан + музыканты + индивидуальная программа',
    basePrice: 250000,
    description: 'Эксклюзивная программа с персональным поздравлением и любимыми композициями гостей.',
    features: ['Персональное посвящение от артиста', 'Гибкий репертуар под атмосферу вечера', 'Фотосессия с гостями'],
    badge: 'VIP Выбор',
  },
  {
    id: 'festival',
    name: 'Полный фанк-бэнд',
    subtitle: 'Большая сцена & Фестиваль',
    duration: '60–75 минут',
    lineup: 'Беслан + барабаны, бас, гитара, клавиши, духовая пачка (7-8 чел.)',
    basePrice: 350000,
    description: 'Максимальный масштаб живого звука. Мощная духовая секция, аналоговый грув и драйв.',
    features: ['100% живой оркестровый звук', 'Фирменные фанк-аранжировки Николая Патрашова', 'Главная сцена любого масштаба'],
    badge: 'Максимум звука',
  },
];

export const REGION_OPTIONS: RegionOption[] = [
  {
    id: 'moscow',
    name: 'Москва и МО (до 50 км)',
    logisticsCost: 0,
    description: 'Логистика включена в базовую стоимость',
  },
  {
    id: 'near_regions',
    name: 'Регионы РФ (до 1000 км / СПб / ЦФО)',
    logisticsCost: 45000,
    description: 'Ж/Д трансфер СВ/Купе + трансфер на площадку',
  },
  {
    id: 'far_regions',
    name: 'Дальние регионы РФ & СНГ (вылет)',
    logisticsCost: 120000,
    description: 'Авиаперелет + гостиница 4* + суточные команды',
  },
];

interface BookingCalculatorProps {
  onSelectFormatAndQuote?: (calc: BookingCalculation) => void;
  onOpenTechRider?: () => void;
  initialFormat?: BookingFormat;
}

export const BookingCalculator: React.FC<BookingCalculatorProps> = ({
  onSelectFormatAndQuote,
  onOpenTechRider,
  initialFormat = 'club',
}) => {
  const [selectedFormat, setSelectedFormat] = useState<BookingFormat>(initialFormat);
  const [selectedRegion, setSelectedRegion] = useState<RegionZone>('moscow');
  const [guestCount, setGuestCount] = useState<number>(80);
  const [addons, setAddons] = useState<BookingAddons>({
    soundBackline: false,
    extendedSet: false,
    customSong: false,
  });

  // Calculate pricing mathematically via shared domain utility
  const calculation = useMemo<BookingCalculation>(() => {
    return calculateBookingCost({
      format: selectedFormat,
      region: selectedRegion,
      guestCount,
      addons,
    });
  }, [selectedFormat, selectedRegion, guestCount, addons]);

  const toggleAddon = (key: keyof BookingAddons) => {
    setAddons((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApplyToBooking = () => {
    if (onSelectFormatAndQuote) {
      onSelectFormatAndQuote(calculation);
    }
  };

  return (
    <div className="glass-panel-gold rounded-3xl p-6 sm:p-10 border border-[#F2A900]/30 shadow-2xl space-y-10">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F5E6CC]/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#F2A900]" />
            <span className="text-xs uppercase tracking-widest text-[#F2A900] font-bold">
              Интерактивный конфигуратор
            </span>
          </div>
          <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-[#F5E6CC] mt-1">
            Калькулятор стоимости выступления
          </h3>
          <p className="text-xs sm:text-sm text-[#8E8E9F] mt-1">
            Выберите формат, регион и масштаб мероприятия для моментального расчета сметы.
          </p>
        </div>

        {onOpenTechRider && (
          <button
            type="button"
            onClick={onOpenTechRider}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A1A22] border border-[#F2A900]/30 hover:border-[#F2A900] text-xs font-bold text-[#F5E6CC] hover:text-[#F2A900] transition-colors self-start sm:self-auto"
          >
            <FileText className="w-4 h-4 text-[#F2A900]" />
            <span>Технический райдер</span>
          </button>
        )}
      </div>

      {/* Step 1: Format Selector Cards */}
      <div className="space-y-4">
        <label className="text-xs uppercase tracking-wider font-bold text-[#F5E6CC] block">
          Шаг 1. Выберите формат выступления
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FORMAT_OPTIONS.map((f) => {
            const isSelected = f.id === selectedFormat;

            return (
              <div
                key={f.id}
                onClick={() => setSelectedFormat(f.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between gap-4 relative ${
                  isSelected
                    ? 'border-[#F2A900] bg-gradient-to-b from-[#1A1A22] to-[#121217] shadow-xl shadow-[#F2A900]/15 scale-[1.02]'
                    : 'border-[#F5E6CC]/10 bg-[#121217]/60 hover:border-[#F2A900]/40 hover:bg-[#1A1A22]'
                }`}
              >
                {/* Badge */}
                {f.badge && (
                  <span
                    className={`absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#F2A900] to-[#FF7700] text-[#0B0B0E]'
                        : 'bg-[#1A1A22] text-[#8E8E9F] border border-[#F5E6CC]/10'
                    }`}
                  >
                    {f.badge}
                  </span>
                )}

                <div>
                  <h4 className="font-display font-bold text-lg text-[#F5E6CC]">{f.name}</h4>
                  <p className="text-xs text-[#F2A900] font-semibold mt-0.5">{f.subtitle}</p>
                  <p className="text-xs text-[#8E8E9F] mt-2 leading-relaxed">{f.description}</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-[#F5E6CC]/10">
                  <div className="text-xs text-[#F5E6CC]/80 font-medium">
                    <span className="text-[#8E8E9F] block text-[10px] uppercase">Состав:</span>
                    {f.lineup}
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-xs text-[#8E8E9F]">База:</span>
                    <span className="font-display font-extrabold text-base text-[#F5E6CC]">
                      от {f.basePrice.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 2: Region Logistics & Guest Count Slider */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
        {/* Region selector */}
        <div className="space-y-4">
          <label className="text-xs uppercase tracking-wider font-bold text-[#F5E6CC] block flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#FF7700]" />
            <span>Шаг 2. География и логистика</span>
          </label>

          <div className="space-y-2.5">
            {REGION_OPTIONS.map((r) => {
              const isSelected = r.id === selectedRegion;

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRegion(r.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-[#F2A900] bg-[#1A1A22] shadow-md'
                      : 'border-[#F5E6CC]/10 bg-[#121217]/50 hover:bg-[#1A1A22]/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-[#F2A900]' : 'border-[#8E8E9F]'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-[#F2A900]" />}
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-[#F5E6CC]">{r.name}</div>
                      <div className="text-[11px] text-[#8E8E9F]">{r.description}</div>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-[#F2A900] flex-shrink-0">
                    {r.logisticsCost === 0 ? '0 ₽' : `+${r.logisticsCost.toLocaleString('ru-RU')} ₽`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Guest Count & Add-ons */}
        <div className="space-y-6">
          {/* Guest Count */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider font-bold text-[#F5E6CC] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#F2A900]" />
                <span>Масштаб события (гости)</span>
              </label>
              <span className="text-sm font-mono font-bold text-[#F2A900]">
                {guestCount} человек ({calculation.guestMultiplier}x)
              </span>
            </div>

            <input
              type="range"
              min="20"
              max="800"
              step="10"
              value={guestCount}
              onChange={(e) => setGuestCount(parseInt(e.target.value, 10))}
              aria-label="Количество гостей"
              className="w-full h-2 bg-[#1A1A22] rounded-lg appearance-none cursor-pointer accent-[#F2A900]"
            />

            <div className="flex justify-between text-[10px] text-[#8E8E9F] font-mono">
              <span>До 50 (1.0x)</span>
              <span>51–200 (1.1x)</span>
              <span>201–500 (1.25x)</span>
              <span>500+ (1.5x)</span>
            </div>
          </div>

          {/* Add-ons checkboxes */}
          <div className="space-y-2 pt-2">
            <span className="text-xs uppercase tracking-wider font-bold text-[#F5E6CC] block">
              Дополнительные опции
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { key: 'soundBackline', label: 'Свой бэклайн (+30к)', cost: 30000 },
                { key: 'extendedSet', label: 'Доп. сет 30м (+50к)', cost: 50000 },
                { key: 'customSong', label: 'Песня на заказ (+40к)', cost: 40000 },
              ].map((addon) => {
                const isChecked = !!addons[addon.key as keyof BookingAddons];

                return (
                  <button
                    key={addon.key}
                    type="button"
                    onClick={() => toggleAddon(addon.key as keyof BookingAddons)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center gap-2 ${
                      isChecked
                        ? 'border-[#F2A900] bg-[#F2A900]/15 text-[#FAF4EB]'
                        : 'border-[#F5E6CC]/10 bg-[#121217]/50 text-[#8E8E9F] hover:text-[#F5E6CC]'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                        isChecked ? 'border-[#F2A900] bg-[#F2A900]' : 'border-[#8E8E9F]'
                      }`}
                    >
                      {isChecked && <Check className="w-2.5 h-2.5 text-[#0B0B0E] stroke-[3]" />}
                    </div>
                    <span className="truncate">{addon.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Banner & Action CTA */}
      <div className="bg-gradient-to-r from-[#1A1A22] via-[#16161F] to-[#1A1A22] p-6 rounded-2xl border border-[#F2A900]/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1 text-center md:text-left">
          <span className="text-xs uppercase tracking-widest text-[#8E8E9F] font-bold">
            Расчётная смета под ключ
          </span>
          <div className="font-display font-extrabold text-3xl sm:text-4xl text-gradient-gold">
            {calculation.totalCost.toLocaleString('ru-RU')} ₽
          </div>
          <div className="text-xs text-[#8E8E9F] flex items-center justify-center md:justify-start gap-2">
            <span>Предоплата при бронировании даты (50%):</span>
            <span className="font-bold text-[#F5E6CC]">
              {calculation.prepayment50.toLocaleString('ru-RU')} ₽
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleApplyToBooking}
          className="w-full md:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#F2A900] to-[#FF7700] text-[#0B0B0E] font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl shadow-[#F2A900]/25 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <span>Забронировать этот расчет</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
