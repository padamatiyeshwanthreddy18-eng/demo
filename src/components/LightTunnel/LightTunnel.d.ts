import React from 'react';

export interface LightTunnelProps {
  cableColor?: string;
  pulseColor?: string;
  tunnelColor?: string;
  tunnelOpacity?: number;
  speed?: number;
  flowDirection?: 'inward' | 'outward';
  pulseSpeed?: number;
  pulseLength?: number;
  pulseBlend?: number;
  pulseWidth?: number;
  cableCount?: number;
  thickness?: number;
  rimWidth?: number;
  waviness?: number;
  sway?: number;
  size?: number;
  centerX?: number;
  centerY?: number;
  glow?: number;
  fadeNear?: number;
  fadeFar?: number;
  brightness?: number;
  colorVariance?: boolean;
  grain?: boolean;
  grainIntensity?: number;
  opacity?: number;
  mouseInteraction?: boolean;
  mouseStrength?: number;
  lightMode?: boolean;
  className?: string;
}

declare const LightTunnel: React.FC<LightTunnelProps>;
export default LightTunnel;
