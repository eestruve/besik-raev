import React, { useState } from 'react';
import { BookingFormat, BookingCalculation } from '../types';
import { validateBookingForm, generateTelegramDeepLink } from '../utils/bookingCalculations';
import { Send, CheckCircle2, AlertCircle, Copy, Check, MessageSquare, Calendar } from 'lucide-react';

interface BookingFormProps {
  initialCalculation?: BookingCalculation;
  onSuccessDispatch?: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  initialCalculation,
  onSuccessDispatch,
}) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [city, setCity] = useState('');
  const [format, setFormat] = useState<BookingFormat>(initialCalculation?.format || 'club');
  const [guestCount, setGuestCount] = useState<number>(initialCalculation?.guestCount || 80);
  const [comment, setComment] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [dispatchedSuccess, setDispatchedSuccess] = useState(false);

  // Update format when initialCalculation changes
  React.useEffect(() => {
    if (initialCalculation) {
      setFormat(initialCalculation.format);
      if (initialCalculation.guestCount) {
        setGuestCount(initialCalculation.guestCount);
      }
    }
  }, [initialCalculation]);

  const validate = (): boolean => {
    const res = validateBookingForm({
      name,
      contact,
      eventDate,
      city,
      format,
      guestCount,
      comment,
    });
    setErrors(res.errors);
    return res.isValid;
  };

  const buildTelegramLink = () => {
    return generateTelegramDeepLink(
      { name, contact, eventDate, city, format, guestCount, comment },
      initialCalculation
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validate()) return;

    setIsSubmitting(true);
    const link = buildTelegramLink();

    // Mark success
    setDispatchedSuccess(true);

    if (onSuccessDispatch) {
      onSuccessDispatch();
    }

    // Open Telegram web link in new window
    window.open(link, '_blank', 'noopener,noreferrer');

    setTimeout(() => {
      setIsSubmitting(false);
    }, 1200);
  };

  const handleCopyLink = () => {
    if (!validate()) return;
    const link = buildTelegramLink();
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="glass-panel-gold rounded-3xl p-6 sm:p-10 border border-[#F2A900]/30 shadow-2xl space-y-8">
      {/* Form Header */}
      <div>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#F2A900]" />
          <span className="text-xs uppercase tracking-widest text-[#F2A900] font-bold">
            Прямой контакт с директором
          </span>
        </div>
        <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-[#F5E6CC] mt-1">
          Заявка на организацию выступления
        </h3>
        <p className="text-xs sm:text-sm text-[#8E8E9F] mt-1">
          Заполните параметры и перейдите в Telegram артиста с готовым текстом обращения. Ответ
          в течение 15 минут.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Organizer Name */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-bold text-[#F5E6CC] block">
              Имя заказчика / Организатора *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например, Константин Лебедев"
              className={`w-full px-4 py-3.5 rounded-2xl bg-[#0B0B0E]/80 border text-sm text-[#F5E6CC] placeholder-[#8E8E9F] focus:outline-none focus:ring-2 transition-all ${
                errors.name
                  ? 'border-[#EF4444] focus:ring-[#EF4444]'
                  : 'border-[#F5E6CC]/15 focus:border-[#F2A900] focus:ring-[#F2A900]'
              }`}
            />
            {errors.name && (
              <p className="text-xs text-[#EF4444] flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* Contact: Phone or TG */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-bold text-[#F5E6CC] block">
              Телефон или Telegram (@username) *
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="+7 (999) 000-00-00 или @username"
              className={`w-full px-4 py-3.5 rounded-2xl bg-[#0B0B0E]/80 border text-sm text-[#F5E6CC] placeholder-[#8E8E9F] focus:outline-none focus:ring-2 transition-all ${
                errors.contact
                  ? 'border-[#EF4444] focus:ring-[#EF4444]'
                  : 'border-[#F5E6CC]/15 focus:border-[#F2A900] focus:ring-[#F2A900]'
              }`}
            />
            {errors.contact && (
              <p className="text-xs text-[#EF4444] flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.contact}</span>
              </p>
            )}
          </div>

          {/* Event Date */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-bold text-[#F5E6CC] block flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#F2A900]" />
              <span>Планируемая дата события *</span>
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className={`w-full px-4 py-3.5 rounded-2xl bg-[#0B0B0E]/80 border text-sm text-[#F5E6CC] focus:outline-none focus:ring-2 transition-all ${
                errors.eventDate
                  ? 'border-[#EF4444] focus:ring-[#EF4444]'
                  : 'border-[#F5E6CC]/15 focus:border-[#F2A900] focus:ring-[#F2A900]'
              }`}
            />
            {errors.eventDate && (
              <p className="text-xs text-[#EF4444] flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.eventDate}</span>
              </p>
            )}
          </div>

          {/* City / Venue */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-bold text-[#F5E6CC] block">
              Город и площадка проведения *
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Москва, Клуб «16 Тонн» или частная вилла"
              className={`w-full px-4 py-3.5 rounded-2xl bg-[#0B0B0E]/80 border text-sm text-[#F5E6CC] placeholder-[#8E8E9F] focus:outline-none focus:ring-2 transition-all ${
                errors.city
                  ? 'border-[#EF4444] focus:ring-[#EF4444]'
                  : 'border-[#F5E6CC]/15 focus:border-[#F2A900] focus:ring-[#F2A900]'
              }`}
            />
            {errors.city && (
              <p className="text-xs text-[#EF4444] flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.city}</span>
              </p>
            )}
          </div>
        </div>

        {/* Selected Format & Guest Count selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-bold text-[#F5E6CC] block">
              Формат выступления
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as BookingFormat)}
              className="w-full px-4 py-3.5 rounded-2xl bg-[#0B0B0E]/80 border border-[#F5E6CC]/15 text-sm text-[#F5E6CC] focus:outline-none focus:border-[#F2A900] focus:ring-2 focus:ring-[#F2A900]"
            >
              <option value="acoustic">Акустика & Лаунж (от 150 000 ₽)</option>
              <option value="club">Клубный драйв (от 180 000 ₽)</option>
              <option value="private">Частное событие / VIP (от 250 000 ₽)</option>
              <option value="festival">Полный фанк-бэнд (от 350 000 ₽)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-bold text-[#F5E6CC] block">
              Примерное число гостей
            </label>
            <input
              type="number"
              min="10"
              max="10000"
              value={guestCount}
              onChange={(e) => setGuestCount(parseInt(e.target.value, 10) || 50)}
              className="w-full px-4 py-3.5 rounded-2xl bg-[#0B0B0E]/80 border border-[#F5E6CC]/15 text-sm text-[#F5E6CC] focus:outline-none focus:border-[#F2A900] focus:ring-2 focus:ring-[#F2A900]"
            />
          </div>
        </div>

        {/* Comments */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider font-bold text-[#F5E6CC] block">
            Дополнительные пожелания / Особенности площадки
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Укажите пожелания по репертуару, таймингу или техническому оснащению площадки..."
            className="w-full px-4 py-3.5 rounded-2xl bg-[#0B0B0E]/80 border border-[#F5E6CC]/15 text-sm text-[#F5E6CC] placeholder-[#8E8E9F] focus:outline-none focus:border-[#F2A900] focus:ring-2 focus:ring-[#F2A900]"
          />
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#F2A900] to-[#FF7700] text-[#0B0B0E] font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-[#F2A900]/25 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Формирование диалога...' : 'Отправить директору в Telegram'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-[#1A1A22] border border-[#F5E6CC]/15 hover:border-[#F2A900] text-[#F5E6CC] hover:text-[#F2A900] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            {copiedLink ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'Ссылка скопирована' : 'Скопировать текст заявки'}</span>
          </button>
        </div>

        {dispatchedSuccess && (
          <div className="p-4 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center gap-3 text-xs text-[#10B981]">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <div>
              <span className="font-bold block">Готово! Заявка подготовлена.</span>
              <span>
                Если Telegram не открылся автоматически, нажмите «Скопировать текст заявки» и
                отправьте директору на @besik_raev.
              </span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
