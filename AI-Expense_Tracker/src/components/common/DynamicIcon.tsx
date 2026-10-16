import React from 'react';
import {
  Utensils,
  ShoppingCart,
  Home,
  Cpu,
  Car,
  Activity,
  Gamepad2,
  ShoppingBag,
  Zap,
  Compass,
  Briefcase,
  Laptop,
  TrendingUp,
  ShieldCheck,
  Plane,
  Wallet,
  CreditCard,
  Sparkles,
  AlertCircle,
  Tag,
  CircleDollarSign,
  Coffee,
  Smartphone,
  Landmark,
  Tv,
  Gift,
  HelpCircle,
  LucideProps,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  Utensils,
  ShoppingCart,
  Home,
  Cpu,
  Car,
  Activity,
  Gamepad2,
  ShoppingBag,
  Zap,
  Compass,
  Briefcase,
  Laptop,
  TrendingUp,
  ShieldCheck,
  Plane,
  Wallet,
  CreditCard,
  Sparkles,
  AlertCircle,
  Tag,
  CircleDollarSign,
  Coffee,
  Smartphone,
  Landmark,
  Tv,
  Gift,
};

interface DynamicIconProps extends LucideProps {
  name: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  const IconComponent = ICON_MAP[name] || HelpCircle;
  return <IconComponent {...props} />;
};

export const AVAILABLE_ICON_NAMES = Object.keys(ICON_MAP);
