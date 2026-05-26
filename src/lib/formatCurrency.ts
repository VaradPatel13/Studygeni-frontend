// Force USD ($) display universally for the UI. Backend still uses gateway currency and conversions.
export function mapSymbolToCurrencyCode(_symbol: string) {
  return 'USD';
}

export function formatPrice(
  amount: number | string | undefined,
  _currencySymbolOrCode: string = '$',
  locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US'
): string {
  if (amount === undefined || amount === null) return '';
  const num = typeof amount === 'number' ? amount : Number(amount);
  if (Number.isNaN(num)) return String(amount);

  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(num);
  } catch (e) {
    return `$${num.toFixed(2)}`;
  }
}

export default formatPrice;
