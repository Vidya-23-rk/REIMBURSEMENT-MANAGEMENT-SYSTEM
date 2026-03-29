import type { CurrencyInfo } from '../types';
import { ChevronDown } from 'lucide-react';

interface Props {
  amount: number | string;
  currency: string;
  currencies: CurrencyInfo[];
  onAmountChange: (val: number) => void;
  onCurrencyChange: (code: string) => void;
  convertedAmount?: number;
  baseCurrency?: string;
  disabled?: boolean;
}

export default function CurrencyInput({
  amount,
  currency,
  currencies,
  onAmountChange,
  onCurrencyChange,
  convertedAmount,
  baseCurrency = 'INR',
  disabled = false,
}: Props) {
  const baseSymbol = currencies.find((c) => c.code === baseCurrency)?.symbol || baseCurrency;

  return (
    <div className="space-y-2">
      <div className="flex rounded-xl border border-surface-200 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
        {/* Currency selector */}
        <div className="relative">
          <select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            disabled={disabled}
            className="appearance-none bg-surface-50 h-full px-3 pr-8 text-sm font-semibold text-surface-700
                       border-r border-surface-200 cursor-pointer focus:outline-none
                       disabled:opacity-50 disabled:cursor-not-allowed"
            id="currency-select"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol} {c.code}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400 pointer-events-none" />
        </div>

        {/* Amount input */}
        <input
          type="number"
          value={amount}
          onChange={(e) => onAmountChange(parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          min="0"
          step="0.01"
          disabled={disabled}
          className="flex-1 px-4 py-3 text-surface-800 bg-white text-right font-mono text-base
                     placeholder-surface-300 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          id="expense-amount"
        />
      </div>

      {/* Converted amount display */}
      {convertedAmount !== undefined && currency !== baseCurrency && Number(amount) > 0 && (
        <div className="flex items-center justify-end gap-1.5 px-1">
          <span className="text-xs text-surface-400">≈</span>
          <span className="text-sm font-mono font-semibold text-primary-600">
            {baseSymbol}{convertedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-surface-400">{baseCurrency}</span>
        </div>
      )}
    </div>
  );
}
