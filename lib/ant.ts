import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./config";

// Ant class to represent each ant in the simulation
export default class Ant {
  x: number;
  y: number;
  angle: number;
  hasFood: boolean;
  speed: number;

  constructor(
    x: number,
    y: number,
    foodSources: { x: number; y: number; radius: number }[]
  ) {
    this.x = x;
    this.y = y;
    const targetFoodSource =
      foodSources[Math.floor(Math.random() * foodSources.length)];
    this.angle = Math.atan2(
      targetFoodSource.y - this.y,
      targetFoodSource.x - this.x
    );
    this.hasFood = false;
    this.speed = 3;
  }

  move(
    foodPheromoneMap: number[][],
    homePheromoneMap: number[][],
    foodSources: { x: number; y: number; radius: number }[],
    nests: { x: number; y: number; radius: number }[],
    randomFactor: number
  ) {
    // Check if ant found food
    for (const food of foodSources) {
      if (
        Math.sqrt(Math.pow(this.x - food.x, 2) + Math.pow(this.y - food.y, 2)) <
        food.radius * 0.7
      ) {
        this.hasFood = true;
        const targetNest = nests[Math.floor(Math.random() * nests.length)];
        this.angle = Math.atan2(targetNest.y - this.y, targetNest.x - this.x);
        break;
      }
    }

    // Check if ant returned to any nest with food
    if (this.hasFood) {
      for (const nest of nests) {
        if (
          Math.sqrt(
            Math.pow(this.x - nest.x, 2) + Math.pow(this.y - nest.y, 2)
          ) <
          nest.radius * 0.7
        ) {
          this.hasFood = false;
          const targetFoodSource =
            foodSources[Math.floor(Math.random() * foodSources.length)];
          this.angle = Math.atan2(
            targetFoodSource.y - this.y,
            targetFoodSource.x - this.x
          );
          break;
        }
      }
    }

    // Sense pheromones in different directions and adjust angle
    const sensorAngle = Math.PI / 4;
    const sensorDistance = 10;

    const leftSensorX = Math.round(
      this.x + sensorDistance * Math.cos(this.angle - sensorAngle)
    );
    const leftSensorY = Math.round(
      this.y + sensorDistance * Math.sin(this.angle - sensorAngle)
    );

    const centerSensorX = Math.round(
      this.x + sensorDistance * Math.cos(this.angle)
    );
    const centerSensorY = Math.round(
      this.y + sensorDistance * Math.sin(this.angle)
    );

    const rightSensorX = Math.round(
      this.x + sensorDistance * Math.cos(this.angle + sensorAngle)
    );
    const rightSensorY = Math.round(
      this.y + sensorDistance * Math.sin(this.angle + sensorAngle)
    );

    // Get pheromone values at sensor positions
    const getPheromoneSensorValue = (
      x: number,
      y: number,
      map: number[][]
    ): number => {
      let closest = -1;

      for (const food of foodSources) {
        const dist = Math.sqrt(
          Math.pow(this.x - food.x, 2) + Math.pow(this.y - food.y, 2)
        );
        if (closest === -1 || dist < closest) {
          closest = dist;
        }
      }

      for (const nest of nests) {
        const dist = Math.sqrt(
          Math.pow(this.x - nest.x, 2) + Math.pow(this.y - nest.y, 2)
        );
        if (closest === -1 || dist < closest) {
          closest = dist;
        }
      }

      if (x >= 0 && x < CANVAS_WIDTH && y >= 0 && y < CANVAS_HEIGHT) {
        return map[y][x] + 0.1 / closest;
      }

      return 0;
    };

    let leftSensor = 0;
    let centerSensor = 0;
    let rightSensor = 0;

    if (/*this.hasFood*/ false) {
      // Following home pheromones when carrying food
      leftSensor = getPheromoneSensorValue(
        leftSensorX,
        leftSensorY,
        homePheromoneMap
      );
      centerSensor = getPheromoneSensorValue(
        centerSensorX,
        centerSensorY,
        homePheromoneMap
      );
      rightSensor = getPheromoneSensorValue(
        rightSensorX,
        rightSensorY,
        homePheromoneMap
      );
    } else {
      // Following food pheromones when searching for food
      leftSensor = getPheromoneSensorValue(
        leftSensorX,
        leftSensorY,
        foodPheromoneMap
      );
      centerSensor = getPheromoneSensorValue(
        centerSensorX,
        centerSensorY,
        foodPheromoneMap
      );
      rightSensor = getPheromoneSensorValue(
        rightSensorX,
        rightSensorY,
        foodPheromoneMap
      );
    }

    // Adjust angle based on pheromone concentration
    if (Math.random() < randomFactor) {
      // Random movement
      if (!this.hasFood) {
        this.angle += (Math.random() - 0.5) * 2 * 0.05;
      }
    } else if (leftSensor > centerSensor && leftSensor > rightSensor) {
      this.angle -= 0.1;
    } else if (rightSensor > centerSensor && rightSensor > leftSensor) {
      this.angle += 0.1;
    }

    // Move ant
    this.x += this.speed * Math.cos(this.angle);
    this.y += this.speed * Math.sin(this.angle);

    // Wrap around edges
    // if (this.x < 0) this.x = CANVAS_WIDTH - 1;
    // if (this.x >= CANVAS_WIDTH) this.x = 0;
    // if (this.y < 0) this.y = CANVAS_HEIGHT - 1;
    // if (this.y >= CANVAS_HEIGHT) this.y = 0;
    if (
      this.x < 30 ||
      this.x >= CANVAS_WIDTH - 30 ||
      this.y < 30 ||
      this.y > CANVAS_HEIGHT - 30
    ) {
      this.angle = Math.atan2(
        CANVAS_HEIGHT / 2 - this.y,
        CANVAS_WIDTH / 2 - this.x
      );
    }

    // Leave pheromone trail
    const pheromoneX = Math.floor(this.x);
    const pheromoneY = Math.floor(this.y);

    if (this.hasFood) {
      // Leave food pheromone when carrying food back to nest
      foodPheromoneMap[pheromoneY][pheromoneX] += 2;
    } else {
      // Leave home pheromone when exploring
      // homePheromoneMap[pheromoneY][pheromoneX] += 2;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Draw ant as a small triangle
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(-4, -4);
    ctx.lineTo(-4, 4);
    ctx.closePath();

    // Color based on whether ant has food
    if (this.hasFood) {
      ctx.fillStyle = "#4ade80"; // Green for ants with food
    } else {
      ctx.fillStyle = "white";
    }

    ctx.fill();
    ctx.restore();
  }
}
