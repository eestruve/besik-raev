// src/utils/bookingCalculations.ts
// Shared domain logic for Beslan commercial booking, cost calculation, and validation

import type { BookingFormat, RegionZone, BookingAddons, BookingCalculation } from '../types/index.ts';

export type EventFormat = BookingFormat;
export type LogisticsRegion = RegionZone | 'regions_near' | 'regions_far';

export interface BookingCalculatorOptions {
  format: BookingFormat;
  region: LogisticsRegion;
  guestCount: number;
  addons?: BookingAddons;
}

export interface BookingCalculationResult {
  format: BookingFormat;
  region: RegionZone;
  guestCount: number;
  baseFee: number;
  baseCost: number;
  logisticsFee: number;
  logisticsCost: number;
  guestMultiplier: number;
  addonsTotal: number;
  addonsCost: number;
  totalCost: number;
  depositRequired: number;
  prepayment50: number;
}

export const BASE_FEES: Record<BookingFormat, number> = {
  acoustic: 150_000,
  club: 180_000,
  private: 250_000,
  festival: 350_000,
};

export const LOGISTICS_FEES: Record<LogisticsRegion, number> = {
  moscow: 0,
  near_regions: 45_000,
  regions_near: 45_000,
  far_regions: 120_000,
  regions_far: 120_000,
};

export const ADDON_PRICES = {
  soundBackline: 30_000,
  extendedSet: 50_000,
  customSong: 40_000,
} as const;

export const FORMAT_NAMES: Record<BookingFormat, string> = {
  acoustic: 'Акустика & Лаунж',
  club: 'Клубный сет (Club Show)',
  private: 'Частное событие / Корпоратив',
  festival: 'Большой фанк-бэнд (Фестиваль)',
};

/**
 * Calculates guest scaling tier:
 *  - <= 50 guests: 1.0x
 *  - 51..200 guests: 1.1x
 *  - 201..500 guests: 1.25x
 *  - > 500 guests: 1.5x
 * Safely clamps invalid, zero, or negative counts to 1.0x.
 */
export function getGuestMultiplier(count: number): number {
  if (typeof count !== 'number' || isNaN(count) || !isFinite(count) || count <= 50) {
    return 1.0;
  }
  if (count <= 200) return 1.1;
  if (count <= 500) return 1.25;
  return 1.5;
}

/**
 * Calculates total commercial performance quote and mandatory 50% deposit.
 */
export function calculateBookingCost(options: BookingCalculatorOptions): BookingCalculationResult {
  const baseFee = BASE_FEES[options.format];
  if (baseFee === undefined) {
    throw new Error(`Invalid event format: ${options.format}`);
  }

  const logisticsFee = LOGISTICS_FEES[options.region];
  if (logisticsFee === undefined) {
    throw new Error(`Invalid logistics region: ${options.region}`);
  }

  const canonicalRegion: RegionZone =
    options.region === 'regions_near' ? 'near_regions' :
    options.region === 'regions_far' ? 'far_regions' :
    (options.region as RegionZone);

  const guestMultiplier = getGuestMultiplier(options.guestCount);

  let addonsTotal = 0;
  if (options.addons?.soundBackline) addonsTotal += ADDON_PRICES.soundBackline;
  if (options.addons?.extendedSet) addonsTotal += ADDON_PRICES.extendedSet;
  if (options.addons?.customSong) addonsTotal += ADDON_PRICES.customSong;

  const scaledFee = Math.round(baseFee * guestMultiplier);
  const totalCost = scaledFee + logisticsFee + addonsTotal;
  const depositRequired = Math.round(totalCost * 0.5);

  return {
    format: options.format,
    region: canonicalRegion,
    guestCount: options.guestCount,
    baseFee,
    baseCost: baseFee,
    logisticsFee,
    logisticsCost: logisticsFee,
    guestMultiplier,
    addonsTotal,
    addonsCost: addonsTotal,
    totalCost,
    depositRequired,
    prepayment50: depositRequired,
  };
}

export interface BookingValidationPayload {
  organizerName?: string;
  name?: string;
  contact?: string;
  phoneOrTg?: string;
  eventDate: string;
  city: string;
  format: BookingFormat;
  guestCount?: number | string;
  comments?: string;
  comment?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Pure validation engine for booking inquiries.
 */
export function validateBookingForm(
  data: BookingValidationPayload,
  currentDate = new Date('2026-11-09')
): ValidationResult {
  const errors: Record<string, string> = {};

  const organizer = (data.organizerName ?? data.name ?? '').trim();
  if (!organizer || organizer.length < 2) {
    errors.organizerName = 'Имя организатора должно содержать минимум 2 символа';
    errors.name = errors.organizerName;
  }

  const rawContact = (data.contact ?? data.phoneOrTg ?? '').trim();
  const phoneClean = rawContact.replace(/[\s\-()]/g, '');
  const isRussianPhone = /^(\+7|8|7)?9\d{9}$/.test(phoneClean);
  const isTelegramHandle = /^@[a-zA-Z0-9_]{3,32}$|^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(rawContact);

  if (!rawContact || (!isRussianPhone && !isTelegramHandle)) {
    errors.contact = 'Укажите корректный номер телефона РФ (+7 9XX XXX-XX-XX) или ник Telegram (@username)';
    errors.phoneOrTg = errors.contact;
  }

  if (!data.eventDate || isNaN(Date.parse(data.eventDate))) {
    errors.eventDate = 'Укажите корректную дату мероприятия в формате ГГГГ-ММ-ДД';
  } else {
    const bookingDate = new Date(data.eventDate);
    const compareDate = new Date(currentDate);
    compareDate.setHours(0, 0, 0, 0);
    if (bookingDate.getTime() < compareDate.getTime()) {
      errors.eventDate = 'Дата мероприятия не может быть в прошлом';
    }
  }

  const city = (data.city || '').trim();
  if (!city || city.length < 2) {
    errors.city = 'Укажите город или площадку проведения';
  }

  if (!BASE_FEES[data.format]) {
    errors.format = 'Выберите один из доступных форматов выступления';
  }

  const rawGuests = data.guestCount;
  const numGuests = typeof rawGuests === 'string' ? parseInt(rawGuests, 10) : rawGuests;
  if (typeof numGuests !== 'number' || isNaN(numGuests) || numGuests <= 0) {
    errors.guestCount = 'Количество гостей должно быть положительным числом';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Builds universal HTTPS Telegram deep link payload.
 */
export function generateTelegramDeepLink(
  data: BookingValidationPayload,
  calc?: BookingCalculationResult | BookingCalculation | { totalCost: number; prepayment50?: number; depositRequired?: number }
): string {
  const organizer = (data.organizerName ?? data.name ?? '').trim();
  const contactStr = (data.contact ?? data.phoneOrTg ?? '').trim();
  const formatName = FORMAT_NAMES[data.format] || data.format;
  const commentsStr = (data.comments ?? data.comment ?? '').trim();

  let costEstimate = 'по согласованию';
  if (calc) {
    const total = calc.totalCost;
    const deposit =
      'depositRequired' in calc && calc.depositRequired !== undefined
        ? calc.depositRequired
        : ('prepayment50' in calc && calc.prepayment50 !== undefined ? calc.prepayment50 : Math.round(total * 0.5));
    costEstimate = `${total.toLocaleString('ru-RU')} ₽ (Предоплата 50%: ${deposit.toLocaleString('ru-RU')} ₽)`;
  }

  const lines = [
    '🎵 Запрос на букинг Беслана (Besik Raev)',
    `• Организатор: ${organizer}`,
    `• Контакт: ${contactStr}`,
    `• Формат: ${formatName}`,
    `• Дата: ${data.eventDate}`,
    `• Город/Локация: ${(data.city || '').trim()}`,
    `• Гостей: ${data.guestCount ?? 80}`,
    `• Расчётная стоимость: ${costEstimate}`,
  ];

  if (commentsStr.length > 0) {
    lines.push(`• Комментарий: ${commentsStr}`);
  }

  const encoded = encodeURIComponent(lines.join('\n'));
  return `https://t.me/besik_raev?text=${encoded}`;
}
