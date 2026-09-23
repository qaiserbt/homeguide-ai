import type { Property } from "../types/property";

/**
 * Demo property: 236 Pringle Ave, Milton, Ontario.
 * Replace or extend this array to add real listings. The admin dashboard
 * (Phase 4) writes to this same shape — swap this file for a real API/DB
 * call in src/services/properties.ts when ready.
 */
export const properties: Property[] = [
  {
    id: "236-pringle",
    slug: "236-pringle",
    address: "236 Pringle Ave",
    city: "Milton",
    province: "Ontario",
    postalCode: "L9T 0A1",
    price: 1699000,
    bedrooms: 4,
    bathrooms: 5,
    squareFeet: 3000,
    propertyType: "Detached",
    description:
      "A beautifully appointed 4-bedroom, 5-bathroom detached home in Milton offering approximately 3,000 square feet of living space, a chef-inspired kitchen, and a finished basement with a separate entrance.",
    exteriorImage: "/properties/demo/exterior.jpg",
    gallery: [
      "/properties/demo/exterior.jpg",
      "/properties/demo/kitchen.jpg",
      "/properties/demo/living-room.jpg",
      "/properties/demo/dining-room.jpg",
      "/properties/demo/primary-bedroom.jpg",
      "/properties/demo/bedroom-2.jpg",
      "/properties/demo/bedroom-3.jpg",
      "/properties/demo/office.jpg",
      "/properties/demo/basement.jpg",
      "/properties/demo/backyard.jpg",
    ],
    floorPlanImage: undefined,
    rooms: [
      {
        id: "exterior",
        name: "Exterior",
        type: "exterior",
        image: "/properties/demo/exterior.jpg",
        order: 1,
        description: "A commanding curb presence with stone accents and a landscaped front yard.",
        narration:
          "Welcome to 236 Pringle Avenue. Before we head inside, take a look at the exterior — stone and brick detailing, a covered entry, and a double car garage set the tone for this beautifully maintained home.",
        features: [
          { title: "Stone & Brick Exterior", icon: "Building2" },
          { title: "Double Car Garage", icon: "Warehouse" },
          { title: "Covered Entry", icon: "DoorOpen" },
        ],
      },
      {
        id: "living-room",
        name: "Living Room",
        type: "living-room",
        image: "/properties/demo/living-room.jpg",
        order: 2,
        description: "A bright, open living room with large windows and elegant finishes.",
        narration:
          "Just inside, the living room welcomes you with soaring windows that flood the space with natural light, rich hardwood flooring, and an open layout that flows easily into the rest of the main floor.",
        features: [
          { title: "Hardwood Flooring", icon: "Layers" },
          { title: "Large Windows", icon: "PanelsTopLeft" },
          { title: "Open Concept Layout", icon: "LayoutGrid" },
        ],
      },
      {
        id: "kitchen",
        name: "Kitchen",
        type: "kitchen",
        image: "/properties/demo/kitchen.jpg",
        order: 3,
        description:
          "A modern kitchen with quartz countertops, a Wolf gas cooktop, built-in Monogram refrigerator, and a spacious centre island.",
        narration:
          "This modern kitchen features quartz countertops, a Wolf gas cooktop, built-in Monogram refrigerator, and a spacious centre island — perfect for family gatherings.",
        features: [
          { title: "Wolf Gas Cooktop", icon: "Flame" },
          { title: "Monogram Refrigerator", icon: "Refrigerator" },
          { title: "Quartz Countertops", icon: "Gem" },
          { title: "Centre Island", icon: "Utensils" },
        ],
      },
      {
        id: "dining-room",
        name: "Dining Room",
        type: "dining-room",
        image: "/properties/demo/dining-room.jpg",
        order: 4,
        description: "A formal dining room ideal for hosting family and friends.",
        narration:
          "The formal dining room sits just off the kitchen, offering an elegant space for entertaining with plenty of room for a large table and easy access for serving.",
        features: [
          { title: "Adjacent to Kitchen", icon: "Utensils" },
          { title: "Formal Entertaining Space", icon: "Sparkles" },
        ],
      },
      {
        id: "primary-bedroom",
        name: "Primary Suite",
        type: "primary-bedroom",
        image: "/properties/demo/primary-bedroom.jpg",
        order: 5,
        description: "A spacious primary retreat with a walk-in closet and ensuite bathroom.",
        narration:
          "Upstairs, the primary suite offers a private retreat with a generous walk-in closet and a spa-inspired ensuite bathroom — a comfortable place to unwind at the end of the day.",
        features: [
          { title: "Walk-In Closet", icon: "DoorClosed" },
          { title: "Ensuite Bathroom", icon: "ShowerHead" },
          { title: "Spacious Layout", icon: "Maximize" },
        ],
      },
      {
        id: "bedroom-2",
        name: "Bedroom 2",
        type: "bedroom",
        image: "/properties/demo/bedroom-2.jpg",
        order: 6,
        description: "A bright secondary bedroom, ideal for children or guests.",
        narration:
          "This second bedroom is bright and well-proportioned, with plenty of closet space — a great fit for children, guests, or a home office.",
        features: [
          { title: "Closet Storage", icon: "DoorClosed" },
          { title: "Bright Windows", icon: "PanelsTopLeft" },
        ],
      },
      {
        id: "bedroom-3",
        name: "Bedroom 3",
        type: "bedroom",
        image: "/properties/demo/bedroom-3.jpg",
        order: 7,
        description: "A comfortable third bedroom with easy access to a shared bathroom.",
        narration:
          "The third bedroom rounds out the upper level, offering a comfortable space with easy access to the shared family bathroom.",
        features: [
          { title: "Closet Storage", icon: "DoorClosed" },
          { title: "Near Family Bath", icon: "ShowerHead" },
        ],
      },
      {
        id: "office",
        name: "Office",
        type: "office",
        image: "/properties/demo/office.jpg",
        order: 8,
        description: "A quiet main-floor office, perfect for remote work.",
        narration:
          "For anyone working from home, this main-floor office offers a quiet, dedicated space tucked away from the main living areas.",
        features: [
          { title: "Main Floor Location", icon: "Home" },
          { title: "Quiet Work Space", icon: "BookOpen" },
        ],
      },
      {
        id: "basement",
        name: "Basement",
        type: "basement",
        image: "/properties/demo/basement.jpg",
        order: 9,
        description: "A finished basement with its own kitchen, laundry, and two full bathrooms.",
        narration:
          "The finished basement includes its own separate entrance, a second kitchen, laundry, and two full bathrooms — ideal for extended family or rental potential.",
        features: [
          { title: "Separate Entrance", icon: "DoorOpen" },
          { title: "Second Kitchen", icon: "CookingPot" },
          { title: "Two Full Bathrooms", icon: "ShowerHead" },
          { title: "Laundry", icon: "WashingMachine" },
        ],
      },
      {
        id: "backyard",
        name: "Backyard",
        type: "backyard",
        image: "/properties/demo/backyard.jpg",
        order: 10,
        description: "A private, fenced backyard with a patio area.",
        narration:
          "To finish the tour, step out back to a private, fenced yard with a patio area — a great spot to relax or entertain outdoors.",
        features: [
          { title: "Fenced Yard", icon: "TreePine" },
          { title: "Patio Area", icon: "Sun" },
        ],
      },
    ],
    features: [
      {
        category: "Interior",
        items: [
          { title: "Hardwood Flooring", icon: "Layers" },
          { title: "Open Concept Main Floor", icon: "LayoutGrid" },
        ],
      },
      {
        category: "Kitchen",
        items: [
          { title: "Wolf Gas Cooktop", icon: "Flame" },
          { title: "Monogram Refrigerator", icon: "Refrigerator" },
          { title: "Quartz Countertops", icon: "Gem" },
          { title: "Centre Island", icon: "Utensils" },
        ],
      },
      {
        category: "Bedrooms",
        items: [
          { title: "4 Bedrooms", icon: "BedDouble" },
          { title: "Primary Walk-In Closet", icon: "DoorClosed" },
        ],
      },
      {
        category: "Bathrooms",
        items: [
          { title: "5 Bathrooms", icon: "ShowerHead" },
          { title: "Spa-Inspired Ensuite", icon: "Sparkles" },
        ],
      },
      {
        category: "Basement",
        items: [
          { title: "Separate Entrance", icon: "DoorOpen" },
          { title: "Second Kitchen", icon: "CookingPot" },
          { title: "Two Full Bathrooms", icon: "ShowerHead" },
        ],
      },
      {
        category: "Exterior",
        items: [
          { title: "Stone & Brick Facade", icon: "Building2" },
          { title: "Fenced Backyard", icon: "TreePine" },
          { title: "Patio Area", icon: "Sun" },
        ],
      },
      {
        category: "Parking",
        items: [{ title: "Double Car Garage", icon: "Warehouse" }],
      },
      {
        category: "Neighbourhood",
        items: [
          { title: "Family-Friendly Community", icon: "Users" },
          { title: "Close to Schools & Parks", icon: "TreePine" },
        ],
      },
    ],
    basement: {
      finished: true,
      separateEntrance: true,
      description:
        "Finished basement with a separate entrance, second kitchen, laundry, and two full bathrooms.",
    },
    parking: {
      type: "Attached Garage",
      spaces: 2,
      description: "Double car garage with additional driveway parking.",
    },
    lot: {
      description: "Landscaped lot with a fenced, private backyard.",
    },
    taxes: { amount: 6800, year: 2025 },
    schools: [
      { name: "Milton District Public School", type: "Elementary" },
      { name: "Craig Kielburger Secondary School", type: "High School" },
    ],
    amenities: [
      { name: "Milton GO Station", category: "Transit" },
      { name: "Neighbourhood Parks", category: "Recreation" },
      { name: "Local Shopping & Dining", category: "Shopping" },
    ],
    agent: {
      name: "Qaiser Butt",
      title: "REALTOR®",
      brokerage: "Royal LePage Certified Realty",
      phone: "+1 (555) 010-2030",
      email: "info@qaiserbutt.ca",
      photo: "/logos/agent-placeholder.svg",
      website: "https://qaiserbutt.ca",
    },
    status: "Active",
    views: 482,
    questionsAsked: 37,
    updatedAt: "2026-09-15",
  },
];

export function getRoomById(property: Property, roomId: string) {
  return property.rooms.find((r) => r.id === roomId);
}
