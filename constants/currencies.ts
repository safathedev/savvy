// Currency definitions for Savvy App

export type CurrencyCode = "GBP" | "USD" | "EUR";

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
}

export const currencies: Record<CurrencyCode, Currency> = {
  GBP: {
    code: "GBP",
    symbol: "\u00A3",
    name: "British Pound",
    locale: "en-GB",
  },
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    locale: "en-US",
  },
  EUR: {
    code: "EUR",
    symbol: "\u20AC",
    name: "Euro",
    locale: "en-IE",
  },
} as const;

export const defaultCurrency: CurrencyCode = "USD";

export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode = "USD",
  options?: Intl.NumberFormatOptions
): string {
  const currency = currencies[currencyCode];
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  try {
    return new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    }).format(safeAmount);
  } catch {
    return `${currency.symbol}${safeAmount.toFixed(2)}`;
  }
}

export function formatCurrencyShort(
  amount: number,
  currencyCode: CurrencyCode = "USD",
  period?: "month" | "year"
): string {
  const currency = currencies[currencyCode];
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  let formattedAmount: string;

  try {
    formattedAmount = new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(safeAmount);
  } catch {
    formattedAmount = safeAmount >= 1000 ? `${(safeAmount / 1000).toFixed(1)}k` : safeAmount.toFixed(0);
    formattedAmount = `${currency.symbol}${formattedAmount}`;
  }

  if (period) {
    return `${formattedAmount}/${period}`;
  }

  return formattedAmount;
}
