export const DEFAULT_DESKTOP_MIN_WIDTH_PX = 1024;

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Mobi|Android|iPhone|iPod|iPad/i.test(navigator.userAgent);
}

export function isDesktopViewport(minWidthPx = DEFAULT_DESKTOP_MIN_WIDTH_PX): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(`(min-width: ${minWidthPx}px)`).matches;
}

