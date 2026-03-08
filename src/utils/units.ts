// CSS標準DPI
const CSS_DPI = 96;

// mm を px に変換
export function mmToPx(mm: number): number {
  return (mm / 25.4) * CSS_DPI;
}

// px を mm に変換
export function pxToMm(px: number): number {
  return (px * 25.4) / CSS_DPI;
}
