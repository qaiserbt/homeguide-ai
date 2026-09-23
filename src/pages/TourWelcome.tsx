import { PropertyHero } from "../components/tour/PropertyHero";
import { useTourContext } from "../hooks/useTourContext";

export function TourWelcome() {
  const { property } = useTourContext();
  return <PropertyHero property={property} />;
}
