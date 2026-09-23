import { useOutletContext } from "react-router-dom";
import type { TourOutletContext } from "../layouts/TourLayout";

export function useTourContext() {
  return useOutletContext<TourOutletContext>();
}
