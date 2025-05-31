import { LatLng } from "leaflet";

// Simulation parameters
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const INITIAL_ANT_COUNT = 200;
export const INITIAL_EVAPORATION_RATE = 0.003;
export const INITIAL_DIFFUSION_RATE = 0.1;
export const INITIAL_RANDOM_FACTOR = 0.3;

// Initial map center (Central Park, NYC)
export const INITIAL_CENTER = new LatLng(48.817582, 2.288987);
export const INITIAL_ZOOM = 14;

// Population density colors
export const DENSITY_COLORS = [
  { min: 0, max: 4000, color: "rgba(144, 0, 255, 0.3)" }, // Very low - light green
  { min: 4000, max: 8000, color: "rgba(221, 0, 255, 0.5)" }, // Low - light yellow
  { min: 8000, max: 12000, color: "rgba(255, 0, 0, 0.7)" }, // Medium - light orange
  { min: 12000, max: 16000, color: "rgba(255, 89, 0, 0.8)" }, // High - light red
  { min: 16000, max: 20000, color: "rgba(255, 245, 55, 0.9)" }, // Very high - light purple
  {
    min: 20000,
    max: Number.POSITIVE_INFINITY,
    color: "rgba(255, 255, 255, 0.95)",
  }, // Extreme - light indigo
];
