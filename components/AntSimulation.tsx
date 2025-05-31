import CanvasOverlay from "@/components/CanvasOverlay";
import MapController from "@/components/MapController";
import PopulationDensityOverlay from "@/components/PopulationDensityOverlay";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Ant from "@/lib/ant";
import * as Config from "@/lib/config";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Info, Layers } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";

import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icons for different waypoint types
const waypointIcons = {
  hospital: new Icon({
    iconUrl:
      "data:image/svg+xml;base64," +
      btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red" width="24" height="24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    `),
    iconSize: [25, 25],
    iconAnchor: [12, 25],
  }),
  shop: new Icon({
    iconUrl:
      "data:image/svg+xml;base64," +
      btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="blue" width="24" height="24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    `),
    iconSize: [25, 25],
    iconAnchor: [12, 25],
  }),
  restaurant: new Icon({
    iconUrl:
      "data:image/svg+xml;base64=" +
      btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="orange" width="24" height="24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    `),
    iconSize: [25, 25],
    iconAnchor: [12, 25],
  }),
  school: new Icon({
    iconUrl:
      "data:image/svg+xml;base64=" +
      btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="green" width="24" height="24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    `),
    iconSize: [25, 25],
    iconAnchor: [12, 25],
  }),
  park: new Icon({
    iconUrl:
      "data:image/svg+xml;base64=" +
      btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="darkgreen" width="24" height="24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    `),
    iconSize: [25, 25],
    iconAnchor: [12, 25],
  }),
};

// Component to handle map clicks
function MapClickHandler({
  onAddWaypoint,
  simulationRunning,
}: {
  onAddWaypoint: (lat: number, lng: number, type: string) => void;
  simulationRunning: boolean;
}) {
  const [selectedType, setSelectedType] = useState<string>("hospital");
  const map = useMap();

  useMapEvents({
    click: (e) => {
      if (!simulationRunning) {
        const { x: x, y: y } = map.latLngToContainerPoint(e.latlng);
        onAddWaypoint(x, y, selectedType);
      }
    },
  });

  return (
    <div className="leaflet-top leaflet-right">
      <div className="leaflet-control leaflet-bar bg-white p-2 shadow-md rounded-md m-2">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Select waypoint type:</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant={selectedType === "hospital" ? "default" : "outline"}
              onClick={() => setSelectedType("hospital")}
              className="text-xs"
            >
              Hospital
            </Button>
            <Button
              size="sm"
              variant={selectedType === "shop" ? "default" : "outline"}
              onClick={() => setSelectedType("shop")}
              className="text-xs"
            >
              Shop
            </Button>
            <Button
              size="sm"
              variant={selectedType === "school" ? "default" : "outline"}
              onClick={() => setSelectedType("school")}
              className="text-xs"
            >
              School
            </Button>
            <Button
              size="sm"
              variant={selectedType === "restaurant" ? "default" : "outline"}
              onClick={() => setSelectedType("restaurant")}
              className="text-xs"
            >
              Restaurant
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {simulationRunning
              ? "Simulation running..."
              : "Click on map to add waypoints"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AntSimulation() {
  const [isRunning, setIsRunning] = useState(false);
  const [antCount, setAntCount] = useState(Config.INITIAL_ANT_COUNT);
  const [evaporationRate, setEvaporationRate] = useState(
    Config.INITIAL_EVAPORATION_RATE
  );
  const [diffusionRate, setDiffusionRate] = useState(
    Config.INITIAL_DIFFUSION_RATE
  );
  const [randomFactor, setRandomFactor] = useState(
    Config.INITIAL_RANDOM_FACTOR
  );
  const [showPopulationDensity, setShowPopulationDensity] = useState(true);
  const [populationData, setPopulationData] = useState<any[]>([]);
  const [isLoadingPopulation, setIsLoadingPopulation] = useState(false);

  const simulationRef = useRef<{
    ants: Ant[];
    foodPheromoneMap: number[][];
    homePheromoneMap: number[][];
    foodSources: { x: number; y: number; radius: number; type: string }[];
    nests: { x: number; y: number; radius: number }[];
    foodCollected: number;
  }>({
    ants: [],
    foodPheromoneMap: Array(Config.CANVAS_HEIGHT)
      .fill(0)
      .map(() => Array(Config.CANVAS_WIDTH).fill(0)),
    homePheromoneMap: Array(Config.CANVAS_HEIGHT)
      .fill(0)
      .map(() => Array(Config.CANVAS_WIDTH).fill(0)),
    foodSources: [],
    nests: [],
    foodCollected: 0,
  });

  //   useEffect(() => {
  //     let timer: NodeJS.Timeout;
  //     if (isRunning) {
  //       timer = setTimeout(() => {
  //         setIsRunning(false);
  //         // Hide ants and overwrite pheromones with full white path
  //         simulationRef.current.ants = []; // Stop rendering ants
  //         const canvas = document.querySelector("canvas");
  //         console.log(canvas);
  //         if (canvas) {
  //           const ctx = canvas.getContext("2d");
  //           if (ctx) {
  //             const imageData = ctx.getImageData(
  //               0,
  //               0,
  //               canvas.width,
  //               canvas.height
  //             );
  //             const data = imageData.data;
  //             for (let i = 0; i < data.length; i += 4) {
  //               // Approx match to purple pher
  //               // omones (keep logic if needed)
  //               if (data[i] > 100 && data[i + 2] > 100) {
  //                 data[i] = 255; // Red
  //                 data[i + 1] = 255; // Green
  //                 data[i + 2] = 255; // Blue
  //                 data[i + 3] = 255; // Full opacity
  //               }
  //             }
  //             ctx.putImageData(imageData, 0, 0);
  //           }
  //         }
  //       }, 1000);
  //     }
  //     return () => clearTimeout(timer);
  //   }, [isRunning]);

  // Initialize simulation
  useEffect(() => {
    if (
      simulationRef.current.nests.length > 0 &&
      simulationRef.current.foodSources.length > 0
    ) {
      // Reset pheromone maps
      simulationRef.current.foodPheromoneMap = Array(Config.CANVAS_HEIGHT)
        .fill(0)
        .map(() => Array(Config.CANVAS_WIDTH).fill(0));
      simulationRef.current.homePheromoneMap = Array(Config.CANVAS_HEIGHT)
        .fill(0)
        .map(() => Array(Config.CANVAS_WIDTH).fill(0));

      // Initialize ants randomly distributed among all nests
      simulationRef.current.ants = [];
      for (let i = 0; i < antCount; i++) {
        // Pick a random nest to start from
        const randomNest =
          simulationRef.current.nests[
            Math.floor(Math.random() * simulationRef.current.nests.length)
          ];
        simulationRef.current.ants.push(
          new Ant(
            randomNest.x + (Math.random() - 0.5) * randomNest.radius,
            randomNest.y + (Math.random() - 0.5) * randomNest.radius,
            simulationRef.current.foodSources
          )
        );
      }
    }
  }, [
    simulationRef.current.nests.length,
    simulationRef.current.foodSources.length,
    antCount,
  ]);

  // Handle population data updates
  const handlePopulationDataUpdate = (data: any[]) => {
    setPopulationData(data);

    let i = 0;
    const nests = [];
    for (const rect of data) {
      if (rect.density > 20000) {
        if (i % 40 === 0 && Math.random() < 0.9) {
          const [{ x: minX, y: minY }, { x: maxX, y: maxY }] = rect.pixelBounds;
          console.log(minX, minY);
          console.log(maxX, maxY);
          const x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
          const y = Math.floor(Math.random() * (maxY - minY + 1)) + minY;
          nests.push({ x, y, radius: 15 });
        }
        i++;
      }
    }
    simulationRef.current.nests = nests;
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-5xl font-bold mb-6 text-center">trANTsit</h1>
      <div className="flex flex-col lg:flex-row gap-6 justify-center items-center">
        <div>
          <div className="relative border border-gray-700 rounded-lg shadow-lg">
            <MapContainer
              center={Config.INITIAL_CENTER}
              zoom={Config.INITIAL_ZOOM}
              style={{
                width: Config.CANVAS_WIDTH,
                height: Config.CANVAS_HEIGHT,
              }}
              zoomControl={true}
              scrollWheelZoom={true}
              doubleClickZoom={true}
              dragging={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                maxZoom={19}
              />

              {/* Population density overlay */}
              {showPopulationDensity && (
                <PopulationDensityOverlay densityData={populationData} />
              )}

              {/* Map controller for fetching population data */}
              <MapController
                onPopulationDataUpdate={handlePopulationDataUpdate}
                onLoadingChange={setIsLoadingPopulation}
              />

              {/* Ant simulation canvas */}
              <CanvasOverlay
                simulationRef={simulationRef}
                isRunning={isRunning}
                evaporationRate={evaporationRate}
                diffusionRate={diffusionRate}
                randomFactor={randomFactor}
              />

              <MapClickHandler
                onAddWaypoint={(x, y, type) => {
                  console.log("ASDFASDFASDFASDFLKAJSDLFJASDLFKJASDLFKJASDf");
                  simulationRef.current.foodSources.push({
                    x: x,
                    y: y,
                    radius: 8,
                    type: type,
                  });
                }}
                simulationRunning={isRunning}
              />
            </MapContainer>

            {/* Layer toggle button */}
            <div className="absolute top-2 right-2 z-[2000] flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant={showPopulationDensity ? "default" : "outline"}
                      onClick={() =>
                        setShowPopulationDensity(!showPopulationDensity)
                      }
                      disabled={isLoadingPopulation}
                    >
                      <Layers className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle Population Density Layer</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Loading indicator */}
              {isLoadingPopulation && (
                <div className="bg-white/90 px-2 py-1 rounded text-xs flex items-center gap-1">
                  <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </div>
              )}
            </div>
          </div>

          {/* Population density legend */}
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <div className="text-xs font-medium mr-2">
              Population Density (people/km²):
            </div>
            {Config.DENSITY_COLORS.map((color, i) => (
              <div key={i} className="flex items-center">
                <div
                  className="w-3 h-3 mr-1 border border-gray-300"
                  style={{
                    backgroundColor: color.color.replace(/[^,]+\)/, "0.8)"),
                  }}
                ></div>
                <span className="text-xs">
                  {color.min}-
                  {color.max < Number.POSITIVE_INFINITY ? color.max : "∞"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-80">
          <Card>
            <CardHeader>
              <CardTitle>Simulation Controls</CardTitle>
              <CardDescription>
                Adjust parameters to see how they affect cooperative ant
                behavior on a real map
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Total Ants: {antCount}
                  </label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total number of ants in the simulation</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Slider
                  value={[antCount]}
                  min={100}
                  max={500}
                  step={50}
                  onValueChange={(value) => setAntCount(value[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Evaporation Rate: {evaporationRate.toFixed(3)}
                  </label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>How quickly pheromones fade away</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Slider
                  value={[evaporationRate]}
                  min={0.001}
                  max={0.05}
                  step={0.001}
                  onValueChange={(value) => setEvaporationRate(value[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Diffusion Rate: {diffusionRate.toFixed(2)}
                  </label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>How quickly pheromones spread to nearby areas</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Slider
                  value={[diffusionRate]}
                  min={0}
                  max={0.5}
                  step={0.01}
                  onValueChange={(value) => setDiffusionRate(value[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Random Movement: {randomFactor.toFixed(2)}
                  </label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          How often ants move randomly instead of following
                          pheromones
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Slider
                  value={[randomFactor]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={(value) => setRandomFactor(value[0])}
                />
              </div>

              <div className="pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Legend:</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <span className="text-xs">Nests</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                      <span className="text-xs">Pheromones</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex gap-2 w-full">
                <Button
                  onClick={() => setIsRunning(!isRunning)}
                  className="flex-1"
                >
                  {isRunning ? "Pause" : "Resume"}
                </Button>
                <Button
                  onClick={() => {
                    setAntCount(Config.INITIAL_ANT_COUNT);
                    setEvaporationRate(Config.INITIAL_EVAPORATION_RATE);
                    setDiffusionRate(Config.INITIAL_DIFFUSION_RATE);
                    setRandomFactor(Config.INITIAL_RANDOM_FACTOR);
                    simulationRef.current.homePheromoneMap = [];
                    simulationRef.current.foodPheromoneMap = [];
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Reset
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
