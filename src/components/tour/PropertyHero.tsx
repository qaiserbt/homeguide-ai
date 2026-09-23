import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { SmartImage } from "../shared/SmartImage";
import { Logo } from "../shared/Logo";
import { AvatarGuide } from "../avatar/AvatarGuide";
import { PropertyStats } from "./PropertyStats";
import type { Property } from "../../types/property";

interface PropertyHeroProps {
  property: Property;
}

export function PropertyHero({ property }: PropertyHeroProps) {
  const firstRoom = property.rooms[0];

  return (
    <div className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <SmartImage
        src={property.exteriorImage}
        alt={`Exterior of ${property.address}`}
        label={property.address}
        roomType="exterior"
        className="absolute inset-0"
        imgClassName="scale-105"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/30 to-navy/90" />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-[calc(1.25rem+env(safe-area-inset-top))] sm:px-8 lg:max-w-lg lg:items-center lg:pt-16 lg:text-center">
        <div className="flex flex-col items-center gap-1 text-center sm:items-start sm:text-left lg:items-center lg:text-center">
          <Logo variant="light" />
          <p className="text-xs font-medium tracking-wide text-white/70 sm:ml-9 lg:ml-0">
            See More. Know More. Feel at Home.
          </p>
        </div>

        <div className="mt-8 max-w-md flex-1 text-center sm:max-w-lg sm:text-left lg:max-w-none lg:flex-none lg:text-center">
          <h1 className="animate-slide-up font-serif text-4xl leading-tight text-white text-shadow-soft sm:text-5xl">
            Your Personal
            <br />
            Home Guide
          </h1>
          <p className="animate-slide-up mt-3 text-base text-white/85 sm:text-lg">
            An interactive tour with AI
          </p>
        </div>

        <div className="mt-6 flex w-full max-w-md justify-center sm:justify-start lg:max-w-none">
          <AvatarGuide
            state="welcome"
            size="lg"
            position="inline"
            message="Hi! I'm your Home Guide. Let's explore this beautiful property together!"
          />
        </div>

        <div className="mt-8 w-full max-w-md space-y-4 pb-28 lg:max-w-sm lg:pb-16">
          <PropertyStats property={property} variant="overlay" />

          <Link
            to={firstRoom ? `/tour/${property.slug}/room/${firstRoom.id}` : `/tour/${property.slug}/ask`}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-4 text-sm font-bold tracking-wide text-navy shadow-gold transition-transform active:scale-[0.98] hover:bg-gold-dark"
          >
            START INTERACTIVE TOUR
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
