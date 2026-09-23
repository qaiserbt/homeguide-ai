import {
  ChefHat,
  Sofa,
  UtensilsCrossed,
  BedDouble,
  Bed,
  ShowerHead,
  Briefcase,
  Boxes,
  Trees,
  Building2,
  Image as ImageIcon,
  type LucideIcon,
} from "lucide-react";
import type { RoomType } from "../types/property";

interface RoomVisual {
  icon: LucideIcon;
  gradient: string;
}

const visuals: Record<RoomType, RoomVisual> = {
  kitchen: { icon: ChefHat, gradient: "from-[#2a3f5f] to-[#0b2545]" },
  "living-room": { icon: Sofa, gradient: "from-[#3a4f6f] to-[#0b2545]" },
  "dining-room": { icon: UtensilsCrossed, gradient: "from-[#2f4560] to-[#0b2545]" },
  "primary-bedroom": { icon: BedDouble, gradient: "from-[#344c68] to-[#0b2545]" },
  bedroom: { icon: Bed, gradient: "from-[#2c4460] to-[#0b2545]" },
  bathroom: { icon: ShowerHead, gradient: "from-[#375170] to-[#0b2545]" },
  office: { icon: Briefcase, gradient: "from-[#2e4359] to-[#0b2545]" },
  basement: { icon: Boxes, gradient: "from-[#243854] to-[#0b2545]" },
  backyard: { icon: Trees, gradient: "from-[#2f5a4c] to-[#0b2545]" },
  exterior: { icon: Building2, gradient: "from-[#3c4f6b] to-[#0b2545]" },
  other: { icon: ImageIcon, gradient: "from-[#324a66] to-[#0b2545]" },
};

export function getRoomVisual(type: RoomType): RoomVisual {
  return visuals[type] ?? visuals.other;
}
