import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/lib/config";
import { useEffect, useRef } from "react";
import { useMap, useMapEvents } from "react-leaflet";

// Canvas overlay component that integrates with react-leaflet
export default function CanvasOverlay({
  simulationRef,
  isRunning,
  evaporationRate,
  diffusionRate,
  randomFactor,
}: {
  simulationRef: React.RefObject<any>;
  isRunning: boolean;
  evaporationRate: number;
  diffusionRate: number;
  randomFactor: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const map = useMap();

  // Handle map interactions
  useMapEvents({
    mouseover: () => {
      // Disable map interactions when mouse is over the canvas area
      map.dragging.disable();
      map.scrollWheelZoom.disable();
    },
    mouseout: () => {
      // Re-enable map interactions when mouse leaves
      map.dragging.enable();
      map.scrollWheelZoom.enable();
    },
  });

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    // const render = () => {
    //   // Clear canvas with semi-transparent background to show map
    //   ctx.clearRect(0, 0, canvas.width, canvas.height);
    //   ctx.fillStyle = "rgba(26, 26, 46, 0.1)"; // Very light background to let population density show through
    //   ctx.fillRect(0, 0, canvas.width, canvas.height);

    //   console.log(isRunning);

    //   // Draw food sources with glow effect
    //   for (const food of simulationRef.current.foodSources) {
    //     // Glow effect
    //     ctx.shadowColor = "#4ade80";
    //     ctx.shadowBlur = 10;
    //     ctx.beginPath();
    //     ctx.arc(food.x, food.y, food.radius, 0, Math.PI * 2);
    //     ctx.fillStyle = "#4ade80";
    //     ctx.fill();
    //     ctx.shadowBlur = 0;
    //   }

    //   // Draw nests with glow effect
    //   for (let i = 0; i < simulationRef.current.nests.length; i++) {
    //     const nest = simulationRef.current.nests[i];

    //     // Glow effect
    //     ctx.shadowColor = "#f87171";
    //     ctx.shadowBlur = 10;
    //     ctx.beginPath();
    //     ctx.arc(nest.x, nest.y, nest.radius, 0, Math.PI * 2);
    //     ctx.fillStyle = "#f87171";
    //     ctx.fill();
    //     ctx.shadowBlur = 0;
    //   }

    //   if (isRunning) {
    //     ctx.clearRect(0, 0, canvas.width, canvas.height);
    //     ctx.fillStyle = "rgba(26, 26, 46, 0.1)"; // Very light background to let population density show through
    //     ctx.fillRect(0, 0, canvas.width, canvas.height);
    //     // Draw food sources with glow effect
    //     for (const food of simulationRef.current.foodSources) {
    //       // Glow effect
    //       ctx.shadowColor = "#4ade80";
    //       ctx.shadowBlur = 10;
    //       ctx.beginPath();
    //       ctx.arc(food.x, food.y, food.radius, 0, Math.PI * 2);
    //       ctx.fillStyle = "#4ade80";
    //       ctx.fill();
    //       ctx.shadowBlur = 0;
    //     }

    //     // Draw nests with glow effect
    //     for (let i = 0; i < simulationRef.current.nests.length; i++) {
    //       const nest = simulationRef.current.nests[i];

    //       // Glow effect
    //       ctx.shadowColor = "#f87171";
    //       ctx.shadowBlur = 10;
    //       ctx.beginPath();
    //       ctx.arc(nest.x, nest.y, nest.radius, 0, Math.PI * 2);
    //       ctx.fillStyle = "#f87171";
    //       ctx.fill();
    //       ctx.shadowBlur = 0;
    //     }

    //     // Draw pheromone trails
    //     const imageData = ctx.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
    //     const data = imageData.data;

    //     for (let y = 0; y < CANVAS_HEIGHT; y++) {
    //       for (let x = 0; x < CANVAS_WIDTH; x++) {
    //         const index = (y * CANVAS_WIDTH + x) * 4;
    //         const foodPheromone = simulationRef.current.foodPheromoneMap[y][x];
    //         const homePheromone = simulationRef.current.homePheromoneMap[y][x];

    //         // Combine both pheromone types into purple intensity
    //         const totalPheromone = foodPheromone + homePheromone;

    //         if (totalPheromone > 0.1) {
    //           // Only show if pheromone is above threshold
    //           const intensity = Math.min(255, totalPheromone * 150);

    //           // Purple coloring for all pheromones
    //           data[index] = intensity * 0.9; // Red component
    //           data[index + 1] = intensity * 0.3; // Green component
    //           data[index + 2] = intensity; // Blue component
    //           data[index + 3] = Math.min(200, intensity * 1.2); // Reduced alpha for better map visibility
    //         } else {
    //           // Transparent for areas with no pheromone
    //           data[index] = 0;
    //           data[index + 1] = 0;
    //           data[index + 2] = 0;
    //           data[index + 3] = 0;
    //         }
    //       }
    //     }

    //     ctx.putImageData(imageData, 0, 0);

    //     // Update and draw ants
    //     for (const ant of simulationRef.current.ants) {
    //       ant.move(
    //         simulationRef.current.foodPheromoneMap,
    //         simulationRef.current.homePheromoneMap,
    //         simulationRef.current.foodSources,
    //         simulationRef.current.nests,
    //         randomFactor
    //       );

    //       ant.draw(ctx);
    //     }

    //     // Evaporation and diffusion of pheromones
    //     const tempFoodMap = simulationRef.current.foodPheromoneMap.map(
    //       (row: number[]) => [...row]
    //     );
    //     const tempHomeMap = simulationRef.current.homePheromoneMap.map(
    //       (row: number[]) => [...row]
    //     );

    //     for (let y = 1; y < CANVAS_HEIGHT - 1; y++) {
    //       for (let x = 1; x < CANVAS_WIDTH - 1; x++) {
    //         // Evaporation

    //         simulationRef.current.foodPheromoneMap[y][x] *= 1 - evaporationRate;
    //         simulationRef.current.homePheromoneMap[y][x] *= 1 - evaporationRate;

    //         // Diffusion
    //         if (diffusionRate > 0) {
    //           const foodDiffusionAmount =
    //             (tempFoodMap[y][x] * diffusionRate) / 4;
    //           const homeDiffusionAmount =
    //             (tempHomeMap[y][x] * diffusionRate) / 4;

    //           // Apply diffusion to neighboring cells
    //           simulationRef.current.foodPheromoneMap[y - 1][x] +=
    //             foodDiffusionAmount;
    //           simulationRef.current.foodPheromoneMap[y + 1][x] +=
    //             foodDiffusionAmount;
    //           simulationRef.current.foodPheromoneMap[y][x - 1] +=
    //             foodDiffusionAmount;
    //           simulationRef.current.foodPheromoneMap[y][x + 1] +=
    //             foodDiffusionAmount;
    //           simulationRef.current.foodPheromoneMap[y][x] -=
    //             foodDiffusionAmount * 4;

    //           simulationRef.current.homePheromoneMap[y - 1][x] +=
    //             homeDiffusionAmount;
    //           simulationRef.current.homePheromoneMap[y + 1][x] +=
    //             homeDiffusionAmount;
    //           simulationRef.current.homePheromoneMap[y][x - 1] +=
    //             homeDiffusionAmount;
    //           simulationRef.current.homePheromoneMap[y][x + 1] +=
    //             homeDiffusionAmount;
    //           simulationRef.current.homePheromoneMap[y][x] -=
    //             homeDiffusionAmount * 4;
    //         }
    //       }
    //     }
    //   }

    //   animationFrameId = requestAnimationFrame(render);
    // };

    const render = () => {
      // Always clear and paint background
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(26, 26, 46, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // if (isRunning) {
      // Draw pheromones
      const imageData = ctx.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
      const data = imageData.data;

      for (let y = 0; y < CANVAS_HEIGHT; y++) {
        for (let x = 0; x < CANVAS_WIDTH; x++) {
          const index = (y * CANVAS_WIDTH + x) * 4;
          const foodPheromone = simulationRef.current.foodPheromoneMap[y][x];
          const homePheromone = simulationRef.current.homePheromoneMap[y][x];
          const total = foodPheromone + homePheromone;

          if (total > 0.1) {
            const intensity = Math.min(255, total * 150);
            data[index] = intensity * 0.9;
            data[index + 1] = intensity * 0.3;
            data[index + 2] = intensity;
            data[index + 3] = Math.min(200, intensity * 1.2);
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      // }
      // Always draw food sources
      for (const food of simulationRef.current.foodSources) {
        ctx.shadowColor = "#4ade80";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(food.x, food.y, food.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#4ade80";
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Always draw nests
      for (const nest of simulationRef.current.nests) {
        ctx.shadowColor = "#f87171";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(nest.x, nest.y, nest.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#f87171";
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Everything else only runs when simulation is running
      if (isRunning) {
        // Move and draw ants
        for (const ant of simulationRef.current.ants) {
          ant.move(
            simulationRef.current.foodPheromoneMap,
            simulationRef.current.homePheromoneMap,
            simulationRef.current.foodSources,
            simulationRef.current.nests,
            randomFactor
          );
          ant.draw(ctx);
        }

        // Evaporation and diffusion
        const tempFoodMap = simulationRef.current.foodPheromoneMap.map(
          (row: number[]) => [...row]
        );
        const tempHomeMap = simulationRef.current.homePheromoneMap.map(
          (row: number[]) => [...row]
        );

        for (let y = 1; y < CANVAS_HEIGHT - 1; y++) {
          for (let x = 1; x < CANVAS_WIDTH - 1; x++) {
            simulationRef.current.foodPheromoneMap[y][x] *= 1 - evaporationRate;
            simulationRef.current.homePheromoneMap[y][x] *= 1 - evaporationRate;

            if (diffusionRate > 0) {
              const foodDiff = (tempFoodMap[y][x] * diffusionRate) / 4;
              const homeDiff = (tempHomeMap[y][x] * diffusionRate) / 4;

              simulationRef.current.foodPheromoneMap[y - 1][x] += foodDiff;
              simulationRef.current.foodPheromoneMap[y + 1][x] += foodDiff;
              simulationRef.current.foodPheromoneMap[y][x - 1] += foodDiff;
              simulationRef.current.foodPheromoneMap[y][x + 1] += foodDiff;
              simulationRef.current.foodPheromoneMap[y][x] -= foodDiff * 4;

              simulationRef.current.homePheromoneMap[y - 1][x] += homeDiff;
              simulationRef.current.homePheromoneMap[y + 1][x] += homeDiff;
              simulationRef.current.homePheromoneMap[y][x - 1] += homeDiff;
              simulationRef.current.homePheromoneMap[y][x + 1] += homeDiff;
              simulationRef.current.homePheromoneMap[y][x] -= homeDiff * 4;
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRunning, evaporationRate, diffusionRate, randomFactor, simulationRef]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 1000,
        pointerEvents: "auto",
      }}
    />
  );
}
