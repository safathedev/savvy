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

export const defaultCurrency: CurrencyCode = "GBP";

export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode = "GBP"
): string {
  const currency = currencies[currencyCode];
  return `${currency.symbol}${amount.toFixed(2)}`;
}

export function formatCurrencyShort(
  amount: number,
  currencyCode: CurrencyCode = "GBP",
  period?: "month" | "year"
): string {
  const currency = currencies[currencyCode];
  const formattedAmount = amount >= 1000 ? `${(amount / 1000).toFixed(1)}k` : amount.toFixed(0);

  if (period) {
    return `${currency.symbol}${formattedAmount}/${period}`;
  }

  return `${currency.symbol}${formattedAmount}`;
}
