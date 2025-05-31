import { decodeGeohash } from "@/app/utils/geohash";
import { LatLng, LatLngBounds } from "leaflet";
import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";

// Map controller component to fetch population density data
export default function MapController({
  onPopulationDataUpdate,
  onLoadingChange,
}: {
  onPopulationDataUpdate: (data: any[]) => void;
  onLoadingChange: (loading: boolean) => void;
}) {
  const map = useMap();
  const [isLoading, setIsLoading] = useState(false);

  // Update loading state
  const updateLoading = (loading: boolean) => {
    setIsLoading(loading);
    onLoadingChange(loading);
  };

  // Fetch initial data on mount
  useEffect(() => {
    fetchPopulationData();
  }, []);

  // Fetch population density data from API
  const fetchPopulationData = async () => {
    if (isLoading) return;
    updateLoading(true);

    // Get auth token
    const tokenResponse = await fetch("/api/auth-token", {
      method: "GET",
    });

    if (!tokenResponse.ok) {
      throw new Error(`Auth request failed: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    const token = tokenData.token;

    // Make API request
    const response = await fetch("/api/population-density", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        area: {
          areaType: "POLYGON",
          boundary: [
            { latitude: 48.831324, longitude: 2.262537 },
            { latitude: 48.831377, longitude: 2.311055 },
            { latitude: 48.803994, longitude: 2.264449 },
            { latitude: 48.803626, longitude: 2.316632 },
          ],
        },
        startDate: "2024-11-29T10:00:00.000Z",
        endDate: "2024-11-29T10:30:00.000Z",
        precision: 7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Population data received:", data);

    // Process the data
    const cellData =
      data.timedPopulationDensityData[0].cellPopulationDensityData;

    // Convert geohash to bounds and extract density
    const processedData = cellData.map((cell: any) => {
      const bounds = decodeGeohash(cell.geohash);
      let density = 0;

      if (cell.populationDensityData.dataType === "DENSITY_ESTIMATION") {
        density = cell.populationDensityData.pplDensity;
      } else if (cell.populationDensityData.dataType === "LOW_DENSITY") {
        density = 5; // Arbitrary low value
      }

      const ne = new LatLng(bounds.minLat, bounds.minLng);
      const sw = new LatLng(bounds.maxLat, bounds.maxLng);

      return {
        bounds: new LatLngBounds(ne, sw),
        density: density,
        dataType: cell.populationDensityData.dataType,
        pixelBounds: [ne, sw].map((coord) => map.latLngToContainerPoint(coord)),
      };
    });

    console.log(`Processed ${processedData.length} population density cells`);
    onPopulationDataUpdate(processedData);

    updateLoading(false);
  };

  return null;
}
