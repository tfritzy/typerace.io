import { Crosshair, Gauge, Flame, Zap, Focus, Shield, Snowflake, Link, Bomb, Swords, Sparkles, Waves, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { type ShipRole, SHIP_BLUEPRINTS, SHIP_BLUEPRINT_MAP, getShipRole } from "./shipBlueprints";

export { SHIP_BLUEPRINTS, SHIP_BLUEPRINT_MAP, getShipRole };
export type { ShipBlueprint, ShipRole } from "./shipBlueprints";

export const ROLE_META: Record<ShipRole, { icon: LucideIcon; label: string; color: string }> = {
  sniper: { icon: Target, label: "Sniper", color: "#f38ba8" },
  buffer: { icon: Sparkles, label: "Buffer", color: "#f9e2af" },
  laser: { icon: Focus, label: "Laser", color: "#cba6f7" },
  dual_shot: { icon: Gauge, label: "Dual Shot", color: "#89b4fa" },
  charge: { icon: Zap, label: "Charge", color: "#f9e2af" },
  pierce_laser: { icon: Swords, label: "Pierce Laser", color: "#b4befe" },
  freeze: { icon: Snowflake, label: "Freeze", color: "#89dceb" },
  plasma: { icon: Flame, label: "Plasma", color: "#fab387" },
  shooter: { icon: Crosshair, label: "Shooter", color: "#94e2d5" },
  ice_beam: { icon: Waves, label: "Ice Beam", color: "#74c7ec" },
  plasma_single: { icon: Bomb, label: "Plasma", color: "#eba0ac" },
  chain: { icon: Link, label: "Chain", color: "#a6e3a1" },
  mac_cannon: { icon: Shield, label: "MAC Cannon", color: "#cdd6f4" },
};
