export type RoomType =
  | "kitchen"
  | "living-room"
  | "dining-room"
  | "primary-bedroom"
  | "bedroom"
  | "bathroom"
  | "office"
  | "basement"
  | "backyard"
  | "exterior"
  | "other";

export interface Feature {
  title: string;
  description?: string;
  /** lucide-react icon name, resolved via src/utils/icons.ts */
  icon?: string;
}

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  /** path under /public, e.g. /properties/demo/kitchen.jpg */
  image: string;
  order: number;
  description: string;
  /** the text spoken by the Home Guide for this room */
  narration: string;
  features: Feature[];
}

export interface FeatureCategory {
  category:
    | "Interior"
    | "Kitchen"
    | "Bedrooms"
    | "Bathrooms"
    | "Basement"
    | "Exterior"
    | "Parking"
    | "Technology"
    | "Neighbourhood";
  items: Feature[];
}

export interface BasementInfo {
  finished: boolean;
  separateEntrance: boolean;
  description?: string;
}

export interface ParkingInfo {
  type: string;
  spaces: number;
  description?: string;
}

export interface LotInfo {
  size?: string;
  frontage?: string;
  depth?: string;
  description?: string;
}

export interface School {
  name: string;
  type: "Elementary" | "Middle" | "High School" | "Other";
  distance?: string;
  rating?: string;
}

export interface Amenity {
  name: string;
  category: string;
  distance?: string;
}

export interface Agent {
  name: string;
  title: string;
  brokerage: string;
  phone: string;
  email: string;
  photo: string;
  website?: string;
}

export interface Property {
  id: string;
  slug: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  propertyType: string;
  description: string;
  exteriorImage: string;
  gallery: string[];
  floorPlanImage?: string;
  rooms: Room[];
  features: FeatureCategory[];
  basement?: BasementInfo;
  parking?: ParkingInfo;
  lot?: LotInfo;
  taxes?: { amount: number; year: number };
  condoFees?: number;
  schools: School[];
  amenities: Amenity[];
  agent: Agent;
  status: "Draft" | "Active" | "Sold" | "Archived";
  views?: number;
  questionsAsked?: number;
  updatedAt: string;
}
