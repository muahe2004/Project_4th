export const BREAKPOINTS = {
  mobile: 767,
  tablet: 1023,
  desktop: 1024,
} as const;

export const MEDIA_QUERY = {
  mobile: `(max-width:${BREAKPOINTS.mobile}px)`,
  tabletAndDown: `(max-width:${BREAKPOINTS.tablet}px)`,
  desktopUp: `(min-width:${BREAKPOINTS.desktop}px)`,
} as const;
