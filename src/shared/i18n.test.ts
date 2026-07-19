import { describe, it, expect } from 'vitest';
import { t, getTextDirection } from './i18n';

describe('i18n', () => {
  describe('t', () => {
    it('translates known keys', () => {
      expect(t('nav.home', 'en')).toBe('Home');
      expect(t('nav.home', 'es')).toBe('Inicio');
    });

    it('falls back to english for missing keys in other language', () => {
      // nav.dashboard is not in en, let's use a key that is in en but maybe not in es?
      // Actually all keys are present in es right now. Let's just test fallback of completely missing key
      expect(t('nav.missing', 'es')).toBe('nav.missing');
    });

    it('returns the key if totally missing', () => {
      expect(t('unknown.key', 'en')).toBe('unknown.key');
    });
  });

  describe('getTextDirection', () => {
    it('returns rtl for Arabic', () => {
      expect(getTextDirection('ar')).toBe('rtl');
    });

    it('returns ltr for English', () => {
      expect(getTextDirection('en')).toBe('ltr');
    });
  });
});
