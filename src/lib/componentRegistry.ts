// Example registry for design library components
import NeonGradientButton from '@/components/Buttons/ShimmerButton';
import CardTilt3D from '@/components/ui/AnimatedOrb';
// ...import other components

export const componentRegistry = [
  {
    name: 'Neon Gradient Button',
    component: NeonGradientButton,
    tier: 'pro',
    description: 'Glowing animated button with glassmorphism',
  },
  {
    name: '3D Card Tilt',
    component: CardTilt3D,
    tier: 'pro',
    description: 'Interactive 3D tilt on hover',
  },
  // ...add more components
];
