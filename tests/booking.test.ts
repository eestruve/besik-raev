/**
 * tests/booking.test.ts
 * Comprehensive Test Suite for Beslan Commercial Booking Engine
 *
 * Covers:
 *   - Tier 1: Feature Coverage (Formats, Logistics, Guest scaling, Deposits, Deep-linking, Form validation)
 *   - Tier 2: Boundary & Corner Cases (Zero/negative guests, extreme scale, XSS/emoji, past dates, empty inputs)
 *   - Tier 3: Cross-Feature Combinations (Dynamic URL updates on calculation changes)
 *   - Tier 4: Real-World Scenarios (Promoter inquiry journey from configuration to dispatch)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ============================================================================
// Core Booking Domain Models & Mathematical Contracts
// Directly imported from production domain utility (Single Source of Truth)
// ============================================================================

import {
  calculateBookingCost,
  getGuestMultiplier,
  validateBookingForm,
  generateTelegramDeepLink,
  BASE_FEES,
  LOGISTICS_FEES,
  ADDON_PRICES,
  type BookingCalculatorOptions,
  type BookingCalculationResult,
  type EventFormat,
  type LogisticsRegion,
  type BookingValidationPayload as BookingFormData,
  type ValidationResult,
} from '../src/utils/bookingCalculations.ts';

export {
  calculateBookingCost,
  getGuestMultiplier,
  validateBookingForm,
  generateTelegramDeepLink,
  BASE_FEES,
  LOGISTICS_FEES,
  ADDON_PRICES,
  type BookingCalculatorOptions,
  type BookingCalculationResult,
  type EventFormat,
  type LogisticsRegion,
  type BookingFormData,
  type ValidationResult,
};

// ============================================================================
// Test Suite Implementation
// ============================================================================

describe('Commercial Booking Engine (tests/booking.test.ts)', () => {

  // --------------------------------------------------------------------------
  // Tier 1: Feature Coverage (Pricing & Calculation Formulas)
  // --------------------------------------------------------------------------
  describe('Tier 1: Feature Coverage — Cost Calculation Formulas', () => {

    it('calculates baseline pricing for Acoustic Lounge in Moscow (0-50 guests)', () => {
      const result = calculateBookingCost({
        format: 'acoustic',
        region: 'moscow',
        guestCount: 40,
      });

      assert.strictEqual(result.baseFee, 150_000);
      assert.strictEqual(result.logisticsFee, 0);
      assert.strictEqual(result.guestMultiplier, 1.0);
      assert.strictEqual(result.addonsTotal, 0);
      assert.strictEqual(result.totalCost, 150_000);
      assert.strictEqual(result.depositRequired, 75_000);
    });

    it('calculates baseline pricing for Club Show in Moscow', () => {
      const result = calculateBookingCost({
        format: 'club',
        region: 'moscow',
        guestCount: 50,
      });

      assert.strictEqual(result.baseFee, 180_000);
      assert.strictEqual(result.totalCost, 180_000);
      assert.strictEqual(result.depositRequired, 90_000);
    });

    it('calculates baseline pricing for Private / Corporate event in Moscow', () => {
      const result = calculateBookingCost({
        format: 'private',
        region: 'moscow',
        guestCount: 30,
      });

      assert.strictEqual(result.baseFee, 250_000);
      assert.strictEqual(result.totalCost, 250_000);
      assert.strictEqual(result.depositRequired, 125_000);
    });

    it('calculates baseline pricing for Festival Live format in Moscow', () => {
      const result = calculateBookingCost({
        format: 'festival',
        region: 'moscow',
        guestCount: 50,
      });

      assert.strictEqual(result.baseFee, 350_000);
      assert.strictEqual(result.totalCost, 350_000);
      assert.strictEqual(result.depositRequired, 175_000);
    });

    it('applies regional logistics surcharge for Near Regions (+45k ₽)', () => {
      const result = calculateBookingCost({
        format: 'acoustic',
        region: 'regions_near',
        guestCount: 20,
      });

      assert.strictEqual(result.logisticsFee, 45_000);
      assert.strictEqual(result.totalCost, 150_000 + 45_000);
      assert.strictEqual(result.depositRequired, 97_500);
    });

    it('applies regional logistics surcharge for Far Regions / CIS (+120k ₽)', () => {
      const result = calculateBookingCost({
        format: 'club',
        region: 'regions_far',
        guestCount: 50,
      });

      assert.strictEqual(result.logisticsFee, 120_000);
      assert.strictEqual(result.totalCost, 180_000 + 120_000);
      assert.strictEqual(result.depositRequired, 150_000);
    });

    it('scales fee by 1.1x for 51-200 guest tier', () => {
      const result = calculateBookingCost({
        format: 'private',
        region: 'moscow',
        guestCount: 120,
      });

      // 250_000 * 1.1 = 275_000
      assert.strictEqual(result.guestMultiplier, 1.1);
      assert.strictEqual(result.totalCost, 275_000);
      assert.strictEqual(result.depositRequired, 137_500);
    });

    it('scales fee by 1.25x for 201-500 guest tier', () => {
      const result = calculateBookingCost({
        format: 'festival',
        region: 'moscow',
        guestCount: 350,
      });

      // 350_000 * 1.25 = 437_500
      assert.strictEqual(result.guestMultiplier, 1.25);
      assert.strictEqual(result.totalCost, 437_500);
      assert.strictEqual(result.depositRequired, 218_750);
    });

    it('scales fee by 1.5x for >500 guest tier', () => {
      const result = calculateBookingCost({
        format: 'festival',
        region: 'moscow',
        guestCount: 1200,
      });

      // 350_000 * 1.5 = 525_000
      assert.strictEqual(result.guestMultiplier, 1.5);
      assert.strictEqual(result.totalCost, 525_000);
      assert.strictEqual(result.depositRequired, 262_500);
    });

    it('accurately tallies optional rider add-ons (Backline, Extended Set, Custom Song)', () => {
      const result = calculateBookingCost({
        format: 'private',
        region: 'moscow',
        guestCount: 40,
        addons: {
          soundBackline: true, // +30k
          extendedSet: true,   // +50k
          customSong: true,    // +40k
        },
      });

      assert.strictEqual(result.addonsTotal, 120_000);
      // 250k base + 120k addons = 370k
      assert.strictEqual(result.totalCost, 370_000);
      assert.strictEqual(result.depositRequired, 185_000);
    });
  });

  // --------------------------------------------------------------------------
  // Tier 1: Feature Coverage — Form Validation & Telegram Deep Linking
  // --------------------------------------------------------------------------
  describe('Tier 1: Feature Coverage — Form Validation & Deep Linking', () => {

    it('validates a completely valid booking inquiry form', () => {
      const formData: BookingFormData = {
        organizerName: 'Константин Лебедев',
        contact: '+7 (916) 123-45-67',
        eventDate: '2026-12-25',
        city: 'Москва, Клуб «16 Тонн»',
        format: 'club',
        guestCount: 150,
        comments: 'Празднование Нового Года компании',
      };

      const validation = validateBookingForm(formData);
      assert.strictEqual(validation.isValid, true);
      assert.deepStrictEqual(validation.errors, {});
    });

    it('accepts Telegram username starting with @ as valid contact', () => {
      const formData: BookingFormData = {
        organizerName: 'Анна Смирнова',
        contact: '@anna_event_pro',
        eventDate: '2027-02-14',
        city: 'Санкт-Петербург',
        format: 'acoustic',
        guestCount: 45,
      };

      const validation = validateBookingForm(formData);
      assert.strictEqual(validation.isValid, true);
    });

    it('generates a syntactically valid Telegram deep link starting with https://t.me/besik_raev', () => {
      const formData: BookingFormData = {
        organizerName: 'Михаил',
        contact: '+79261112233',
        eventDate: '2027-01-20',
        city: 'Сочи',
        format: 'private',
        guestCount: 80,
      };
      const calc = calculateBookingCost({ format: 'private', region: 'regions_near', guestCount: 80 });
      const url = generateTelegramDeepLink(formData, calc);

      assert.ok(url.startsWith('https://t.me/besik_raev?text='));
      assert.ok(!url.includes(' ')); // no unencoded spaces
      assert.ok(url.includes(encodeURIComponent('Михаил')));
      assert.ok(url.includes(encodeURIComponent('Сочи')));
    });

    it('includes estimated fee and 50% deposit in Telegram message payload', () => {
      const formData: BookingFormData = {
        organizerName: 'Ирина',
        contact: '@irina_fest',
        eventDate: '2027-06-15',
        city: 'Казань',
        format: 'festival',
        guestCount: 300,
      };
      const calc = calculateBookingCost({ format: 'festival', region: 'regions_near', guestCount: 300 });
      const url = generateTelegramDeepLink(formData, calc);

      const decoded = decodeURIComponent(url.replace('https://t.me/besik_raev?text=', ''));
      assert.ok(decoded.includes('Большой фанк-бэнд'));
      assert.ok(decoded.includes('Предоплата 50%'));
      assert.ok(decoded.includes(calc.totalCost.toLocaleString('ru-RU')));
    });
  });

  // --------------------------------------------------------------------------
  // Tier 2: Boundary & Corner Cases
  // --------------------------------------------------------------------------
  describe('Tier 2: Boundary & Corner Cases', () => {

    it('handles zero and negative guest count gracefully (clamps to minimum multiplier 1.0)', () => {
      assert.strictEqual(getGuestMultiplier(0), 1.0);
      assert.strictEqual(getGuestMultiplier(-50), 1.0);

      const result = calculateBookingCost({
        format: 'acoustic',
        region: 'moscow',
        guestCount: 0,
      });
      assert.strictEqual(result.guestMultiplier, 1.0);
      assert.strictEqual(result.totalCost, 150_000);
    });

    it('handles extreme guest counts (e.g. 50,000 stadium festival) capped at 1.5x scaling', () => {
      assert.strictEqual(getGuestMultiplier(50_000), 1.5);
      const result = calculateBookingCost({
        format: 'festival',
        region: 'regions_far',
        guestCount: 50_000,
      });

      // 350k * 1.5 = 525k + 120k logistics = 645k
      assert.strictEqual(result.totalCost, 645_000);
      assert.strictEqual(result.depositRequired, 322_500);
    });

    it('rejects booking date in the past', () => {
      const pastData: BookingFormData = {
        organizerName: 'Олег',
        contact: '+79998887766',
        eventDate: '2025-01-01', // Date in the past relative to 2026-11-09
        city: 'Москва',
        format: 'club',
        guestCount: 100,
      };

      const validation = validateBookingForm(pastData);
      assert.strictEqual(validation.isValid, false);
      assert.ok(validation.errors.eventDate.includes('прошлом'));
    });

    it('rejects empty or whitespace-only organizer name', () => {
      const emptyNameData: BookingFormData = {
        organizerName: '   ',
        contact: '+79998887766',
        eventDate: '2026-12-31',
        city: 'Москва',
        format: 'club',
        guestCount: 100,
      };

      const validation = validateBookingForm(emptyNameData);
      assert.strictEqual(validation.isValid, false);
      assert.ok(validation.errors.organizerName);
    });

    it('rejects invalid contact string (neither phone nor valid telegram handle)', () => {
      const invalidContacts = ['123', 'invalid@@handle', 'ab!cd', 'some_email@without_domain'];
      for (const contact of invalidContacts) {
        const validation = validateBookingForm({
          organizerName: 'Дмитрий',
          contact,
          eventDate: '2026-12-31',
          city: 'Москва',
          format: 'club',
          guestCount: 50,
        });
        assert.strictEqual(validation.isValid, false, `Expected contact "${contact}" to fail validation`);
        assert.ok(validation.errors.contact);
      }
    });

    it('sanitizes and safely encodes Cyrillic, emoji, and XSS probe strings in comments', () => {
      const xssData: BookingFormData = {
        organizerName: 'Мария <script>alert("xss")</script>',
        contact: '+79990001122',
        eventDate: '2027-03-08',
        city: 'Екатеринбург 🎉',
        format: 'acoustic',
        guestCount: 35,
        comments: 'Нужен живой звук! 🎷🔥 "drop table bookings;--',
      };

      const calc = calculateBookingCost({ format: 'acoustic', region: 'regions_near', guestCount: 35 });
      const url = generateTelegramDeepLink(xssData, calc);

      // Verify URL is clean and doesn't contain raw script tags or unescaped characters
      assert.ok(!url.includes('<script>'));
      assert.ok(!url.includes('\n'));
      assert.ok(url.startsWith('https://t.me/besik_raev?text='));

      const decoded = decodeURIComponent(url);
      assert.ok(decoded.includes('Мария <script>alert("xss")</script>'));
      assert.ok(decoded.includes('Екатеринбург 🎉'));
      assert.ok(decoded.includes('Нужен живой звук! 🎷🔥'));
    });
  });

  // --------------------------------------------------------------------------
  // Tier 3: Cross-Feature Combinations
  // --------------------------------------------------------------------------
  describe('Tier 3: Cross-Feature Combinations', () => {

    it('dynamically recalculates total and updates Telegram deep link when format changes', () => {
      const baseForm: BookingFormData = {
        organizerName: 'Артур',
        contact: '@artur_events',
        eventDate: '2027-05-20',
        city: 'Краснодар',
        format: 'acoustic',
        guestCount: 50,
      };

      // 1. Initial Acoustic calculation
      const calcAcoustic = calculateBookingCost({ format: 'acoustic', region: 'regions_near', guestCount: 50 });
      const urlAcoustic = generateTelegramDeepLink(baseForm, calcAcoustic);

      // 2. Switched to Festival calculation
      const festivalForm: BookingFormData = { ...baseForm, format: 'festival' };
      const calcFestival = calculateBookingCost({ format: 'festival', region: 'regions_near', guestCount: 50 });
      const urlFestival = generateTelegramDeepLink(festivalForm, calcFestival);

      assert.notStrictEqual(calcAcoustic.totalCost, calcFestival.totalCost);
      assert.notStrictEqual(urlAcoustic, urlFestival);
      assert.ok(decodeURIComponent(urlAcoustic).includes('Акустика & Лаунж'));
      assert.ok(decodeURIComponent(urlFestival).includes('Большой фанк-бэнд'));
    });

    it('synchronizes deposit requirement exactly to 50% across any combination of options', () => {
      const combinations: BookingCalculatorOptions[] = [
        { format: 'acoustic', region: 'moscow', guestCount: 20 },
        { format: 'club', region: 'regions_near', guestCount: 150 },
        { format: 'private', region: 'regions_far', guestCount: 300, addons: { extendedSet: true } },
        { format: 'festival', region: 'regions_far', guestCount: 1500, addons: { soundBackline: true, customSong: true } },
      ];

      for (const comb of combinations) {
        const result = calculateBookingCost(comb);
        assert.strictEqual(
          result.depositRequired,
          Math.round(result.totalCost * 0.5),
          `Deposit for ${comb.format} must be exactly 50%`
        );
      }
    });
  });

  // --------------------------------------------------------------------------
  // Tier 4: Real-World Scenarios
  // --------------------------------------------------------------------------
  describe('Tier 4: Real-World Scenarios — Promoter Booking Inquiry Journey', () => {

    it('executes complete promoter booking inquiry journey', () => {
      // Step 1: Promoter lands on site and chooses Festival format in St. Petersburg
      const promoterInquiry: BookingCalculatorOptions = {
        format: 'festival',
        region: 'regions_near', // St. Petersburg (<1000 km from Moscow)
        guestCount: 450,        // 201-500 bracket -> 1.25x
        addons: {
          soundBackline: true,  // +30,000 ₽
          extendedSet: true,    // +50,000 ₽
        },
      };

      // Step 2: Calculator evaluates pricing
      // Base: 350,000 * 1.25 = 437,500
      // Logistics: 45,000
      // Addons: 30,000 + 50,000 = 80,000
      // Total: 437,500 + 45,000 + 80,000 = 562,500 ₽
      // Deposit: 281,250 ₽
      const calculation = calculateBookingCost(promoterInquiry);
      assert.strictEqual(calculation.totalCost, 562_500);
      assert.strictEqual(calculation.depositRequired, 281_250);

      // Step 3: Promoter fills booking form
      const bookingForm: BookingFormData = {
        organizerName: 'Владимир Романов (Aurora Concert Agency)',
        contact: '+7 (921) 987-65-43',
        eventDate: '2027-07-10',
        city: 'Санкт-Петербург, Севкабель Порт',
        format: promoterInquiry.format,
        guestCount: promoterInquiry.guestCount,
        comments: 'Главная сцена летнего фестиваля. Требуется полный техрайдер.',
      };

      // Step 4: Validate form inputs
      const validation = validateBookingForm(bookingForm);
      assert.strictEqual(validation.isValid, true);
      assert.deepStrictEqual(validation.errors, {});

      // Step 5: Generate Telegram dispatch link
      const telegramLink = generateTelegramDeepLink(bookingForm, calculation);
      assert.ok(telegramLink.startsWith('https://t.me/besik_raev?text='));

      const messageContent = decodeURIComponent(telegramLink);
      assert.ok(messageContent.includes('Владимир Романов'));
      assert.ok(messageContent.includes('Севкабель Порт'));
      assert.ok(messageContent.includes(calculation.totalCost.toLocaleString('ru-RU')));
      assert.ok(messageContent.includes(calculation.depositRequired.toLocaleString('ru-RU')));
      assert.ok(messageContent.includes('Главная сцена'));
    });
  });
});
