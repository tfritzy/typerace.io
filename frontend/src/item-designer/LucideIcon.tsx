import * as icons from "lucide-react";

interface DynamicIconProps {
  name: string;
  size?: number;
  color?: string;
}

export function LucideIcon({ name, size, color }: DynamicIconProps) {
  const iconMap = icons as unknown as Record<string, React.ComponentType<{ size?: number; color?: string }>>;
  const IconComponent = iconMap[name];
  if (!IconComponent) {
    return <icons.HelpCircle size={size} color={color} />;
  }
  return <IconComponent size={size} color={color} />;
}
