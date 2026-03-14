export const formatRp = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

export const formatRpCompact = (n) => {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}K`;
  return formatRp(n);
};

export const formatNum = (n) =>
  new Intl.NumberFormat("id-ID").format(n);

export const formatPct = (n) => `${n}%`;
