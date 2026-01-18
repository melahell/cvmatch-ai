export interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  animated?: boolean;
  variant?: 'light' | 'dark' | 'color';
}

export enum AnimationState {
  IDLE = 'idle',
  HOVER = 'hover',
  TAP = 'tap'
}