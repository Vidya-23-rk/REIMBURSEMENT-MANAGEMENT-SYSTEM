import { useState, useEffect } from 'react';
import { currencyApi } from '../api/currency.api';
import type { CurrencyInfo } from '../types';

export function useCurrency() {
  const [currencies, setCurrencies] = useState<CurrencyInfo[]>([]);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [currList, rateData] = await Promise.all([
          currencyApi.getCurrencyList(),
          currencyApi.getRates(),
        ]);
        setCurrencies(currList);
        setRates(rateData.rates);
      } catch (err) {
        console.error('Failed to load currency data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const convert = (amount: number, from: string, to: string = 'INR'): number => {
    if (from === to) return amount;
    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;
    return (amount / fromRate) * toRate;
  };

  const getSymbol = (code: string): string => {
    return currencies.find((c) => c.code === code)?.symbol || code;
  };

  return { currencies, rates, isLoading, convert, getSymbol };
}
