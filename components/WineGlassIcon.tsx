import Svg, { Path } from 'react-native-svg';

interface WineGlassIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Thin-stroke wine glass used as the brand emblem.
 */
export function WineGlassIcon({
  size = 44,
  color = '#D6B173',
  strokeWidth = 1.25,
}: WineGlassIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path
        d="M14.5 9.5h19c0 9.5-3.6 17.5-9.5 17.5s-9.5-8-9.5-17.5z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <Path
        d="M24 27v13"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M16.5 40.5h15"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}
