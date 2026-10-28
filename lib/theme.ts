/**
 * Cellar design system.
 *
 * Burgundy + gold palette meant to evoke a private wine cellar: deep
 * backgrounds, serif typography and golden accents.
 */

export const colors = {
  burgundy: {
    /** Deepest background, at the bottom of the screen. */
    deep: '#1B0509',
    /** Gradient base. */
    base: '#2E0A13',
    /** Middle of the gradient. */
    mid: '#4A1020',
    /** Top glow behind the logo. */
    glow: '#7C2438',
  },
  gold: {
    /** Primary gold for titles and accents. */
    primary: '#D6B173',
    /** More saturated gold for lines and fine details. */
    line: '#C9A227',
    /** Translucent gold for separators and halos. */
    faint: 'rgba(214, 177, 115, 0.45)',
  },
  cream: '#F6EDE4',
  rose: {
    /** Secondary text on burgundy backgrounds. */
    text: '#C7A6AC',
    /** Legal text, more subdued. */
    dim: 'rgba(199, 166, 172, 0.55)',
  },
  surface: '#FFFFFF',
  ink: '#141414',

  /** Warm background for inner screens. */
  paper: '#FAF6F1',
  /** Card surface. */
  card: '#FFFFFF',
  /** Sand: chips, circles and secondary blocks. */
  sand: '#F1E9E1',
  /** Brand burgundy for text and actions. */
  wine: '#5A0E24',
  /** Destructive actions and form errors. */
  danger: '#C0392B',
  /** Primary text. */
  text: '#3D2B2B',
  /** Secondary text. */
  muted: '#7A6862',
  /** Rating stars. */
  star: '#E9B44C',
  /** Empty star outline. */
  starEmpty: '#EBDCBE',
  /** Hairlines and separators. */
  hairline: 'rgba(90, 14, 36, 0.08)',
} as const;

/** Vertical app background gradient. */
export const backgroundGradient = [
  colors.burgundy.glow,
  colors.burgundy.mid,
  colors.burgundy.base,
  colors.burgundy.deep,
] as const;

/** Background gradient stop positions. */
export const backgroundGradientLocations = [0, 0.28, 0.62, 1] as const;

export const fonts = {
  /** Headlines. */
  serif: 'PlayfairDisplay_400Regular',
  /** Gold italic accent. */
  serifItalic: 'PlayfairDisplay_400Regular_Italic',
  /** Wordmark and heavily tracked text. */
  serifMedium: 'PlayfairDisplay_500Medium',
  /** Card headlines. */
  serifSemiBold: 'PlayfairDisplay_600SemiBold',
  /** Logo small caps (more elegant and narrower). */
  display: 'CormorantGaramond_500Medium',
} as const;

export const radii = {
  pill: 999,
} as const;
