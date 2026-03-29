import axios from 'axios';
import env from '../../config/env';
import { getCache, setCache } from './currency.cache';

export class CurrencyService {
  /**
   * Get exchange rates with caching (1hr TTL)
   */
  async getRates(base: string = 'USD'): Promise<Record<string, number>> {
    const cacheKey = `rates_${base}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
      if (env.EXCHANGERATE_API_KEY) {
        const res = await axios.get(
          `https://v6.exchangerate-api.com/v6/${env.EXCHANGERATE_API_KEY}/latest/${base}`,
          { timeout: 10000 }
        );
        const rates = res.data.conversion_rates;
        setCache(cacheKey, rates);
        return rates;
      }

      // Fallback: use free API (no key needed, limited)
      const res = await axios.get(
        `https://open.er-api.com/v6/latest/${base}`,
        { timeout: 10000 }
      );
      const rates = res.data.rates;
      setCache(cacheKey, rates);
      return rates;
    } catch (error) {
      // Return base currency with rate 1 as fallback
      console.warn('⚠️ Currency API unavailable. Using base rate only.');
      return { [base]: 1 };
    }
  }

  /**
   * Convert amount from one currency to another
   */
  async convert(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) return amount;

    const rates = await this.getRates(fromCurrency);
    const rate = rates[toCurrency];

    if (!rate) {
      console.warn(`⚠️ No rate found for ${fromCurrency} → ${toCurrency}. Using 1:1.`);
      return amount;
    }

    return parseFloat((amount * rate).toFixed(2));
  }

  /**
   * Get list of supported currencies from REST Countries API
   */
  async getCurrencyList(): Promise<{ code: string; name: string; symbol: string }[]> {
    const cacheKey = 'currency_list';
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
      const res = await axios.get(
        'https://restcountries.com/v3.1/all?fields=currencies',
        { timeout: 10000 }
      );

      const currencyMap = new Map<string, { code: string; name: string; symbol: string }>();

      for (const country of res.data) {
        if (country.currencies) {
          for (const [code, info] of Object.entries(country.currencies) as any) {
            if (!currencyMap.has(code)) {
              currencyMap.set(code, {
                code,
                name: info.name || code,
                symbol: info.symbol || code,
              });
            }
          }
        }
      }

      const list = Array.from(currencyMap.values()).sort((a, b) => a.code.localeCompare(b.code));
      setCache(cacheKey, list);
      return list;
    } catch {
      // Fallback with common currencies
      return [
        { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'GBP', name: 'British Pound', symbol: '£' },
      ];
    }
  }
}

export const currencyService = new CurrencyService();
