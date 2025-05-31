import { DENSITY_COLORS } from "@/lib/config";
import { Rectangle } from "react-leaflet";

// Population density data overlay component
export default function PopulationDensityOverlay({
  densityData,
}: {
  densityData: any[];
}) {
  if (!densityData || densityData.length === 0) return null;

  return (
    <>
      {densityData.map((cell, index) => {
        const bounds = cell.bounds;
        const density = cell.density;

        // Find appropriate color based on density
        const colorInfo =
          DENSITY_COLORS.find((c) => density >= c.min && density < c.max) ||
          DENSITY_COLORS[0];

        return (
          <Rectangle
            className="blur-xl"
            key={index}
            bounds={bounds}
            pathOptions={{
              color: "transparent",
              fillColor: colorInfo.color,
              fillOpacity: 1,
            }}
          />
        );
      })}
    </>
  );
}
