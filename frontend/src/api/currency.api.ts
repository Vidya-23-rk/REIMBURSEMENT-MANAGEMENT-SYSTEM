import api from './axios';
import { mockCurrencies, mockRates } from './mock';
import type { CurrencyInfo, CurrencyRates } from '../types';
import { USE_MOCK } from '../config';


export const currencyApi = {
  getCurrencyList: async (): Promise<CurrencyInfo[]> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 200));
      return mockCurrencies;
    }
    const { data } = await api.get<{ success: true; data: CurrencyInfo[] }>('/currency/list');
    return data.data;
  },

  getRates: async (base: string = 'INR'): Promise<CurrencyRates> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 200));
      return { rates: mockRates };
    }
    const { data } = await api.get<{ success: true; data: CurrencyRates }>('/currency/rates', {
      params: { base },
    });
    return data.data;
  },
};
