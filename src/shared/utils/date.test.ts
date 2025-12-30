import { parseBrazilianDate, formatDateISO, normalizeDateString } from './date.js';

describe('Date utilities', () => {
  describe('parseBrazilianDate', () => {
    it('should parse valid Brazilian date', () => {
      const date = parseBrazilianDate('15/03/2025');
      expect(date.getDate()).toBe(15);
      expect(date.getMonth()).toBe(2); // 0-indexed
      expect(date.getFullYear()).toBe(2025);
    });

    it('should throw on invalid format', () => {
      expect(() => parseBrazilianDate('2025-03-15')).toThrow();
      expect(() => parseBrazilianDate('15/03')).toThrow();
    });

    it('should throw on invalid date values', () => {
      expect(() => parseBrazilianDate('32/01/2025')).toThrow();
      expect(() => parseBrazilianDate('15/13/2025')).toThrow();
    });
  });

  describe('formatDateISO', () => {
    it('should format date to ISO string', () => {
      const date = new Date('2025-03-15T10:00:00Z');
      const iso = formatDateISO(date);
      expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('normalizeDateString', () => {
    it('should trim and normalize spaces', () => {
      expect(normalizeDateString('  15/03/2025  ')).toBe('15/03/2025');
      expect(normalizeDateString('15/03/2025  10:00')).toBe('15/03/2025 10:00');
    });
  });
});


