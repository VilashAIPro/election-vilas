const { getScoreMessage, isFutureDate, formatIndianDate } = require('../js/utils');

describe('Utility Functions', () => {
  describe('getScoreMessage', () => {
    test('returns perfect score message for 100%', () => {
      expect(getScoreMessage(10, 10)).toBe('Perfect score! You could run for office.');
    });

    test('returns appropriate messages for different tiers', () => {
      expect(getScoreMessage(8, 10)).toBe('Excellent! You\'re election-ready.');
      expect(getScoreMessage(6, 10)).toBe('Well done! You know your Indian elections.');
      expect(getScoreMessage(4, 10)).toBe('Good effort! A few more reads and you\'ll nail it.');
      expect(getScoreMessage(2, 10)).toBe('Getting there! Read the India Guide section.');
      expect(getScoreMessage(0, 10)).toBe('Keep studying! Review the guide above.');
    });

    test('handles edge cases and invalid inputs', () => {
      expect(getScoreMessage(-1, 10)).toBe('Invalid score');
      expect(getScoreMessage(11, 10)).toBe('Invalid score');
      expect(getScoreMessage(5, 0)).toBe('Invalid score');
    });
  });

  describe('isFutureDate', () => {
    test('returns true for future dates', () => {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);
      expect(isFutureDate(future.toISOString())).toBe(true);
    });

    test('returns false for past dates', () => {
      const past = new Date('2000-01-01');
      expect(isFutureDate(past.toISOString())).toBe(false);
    });

    test('handles invalid date strings gracefully', () => {
      expect(isFutureDate('invalid-date')).toBe(false);
      expect(isFutureDate('')).toBe(false);
    });
  });

  describe('formatIndianDate', () => {
    test('formats dates correctly for Indian locale', () => {
      expect(formatIndianDate('2024-05-01')).toBe('1 May 2024');
    });

    test('returns invalid for bad input', () => {
      expect(formatIndianDate('not-a-date')).toBe('Invalid Date');
    });
  });
});
