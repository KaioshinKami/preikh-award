export type Flake = {
  x: number;
  y: number;
  radius: number;
  fallSpeed: number;
  swayAmplitude: number;
  swayFrequency: number;
  phase: number;
  opacity: number;
};

const AREA_PER_FLAKE = 6500;
const MIN_FLAKES = 45;
const MAX_FLAKES = 260;
const WIND_SPEED = 10;
const SPRITE_SIZE = 64;

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

// One soft radial-gradient sprite, scaled per flake: much cheaper than shadowBlur.
export function createFlakeSprite(): HTMLCanvasElement {
  const sprite = document.createElement('canvas');
  sprite.width = SPRITE_SIZE;
  sprite.height = SPRITE_SIZE;
  const context = sprite.getContext('2d');
  if (!context) return sprite;

  const center = SPRITE_SIZE / 2;
  const gradient = context.createRadialGradient(center, center, 0, center, center, center);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.35, 'rgba(240, 249, 255, 0.85)');
  gradient.addColorStop(1, 'rgba(224, 242, 254, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  return sprite;
}

function createFlake(width: number, height: number): Flake {
  const depth = Math.random();

  return {
    x: Math.random() * width,
    y: Math.random() * height,
    radius: 1.2 + depth * depth * 5,
    fallSpeed: 16 + depth * 64,
    swayAmplitude: randomBetween(8, 28),
    swayFrequency: randomBetween(0.4, 1.2),
    phase: Math.random() * Math.PI * 2,
    opacity: 0.3 + depth * 0.6,
  };
}

export function createFlakes(width: number, height: number): Flake[] {
  const count = Math.round((width * height) / AREA_PER_FLAKE);
  const clampedCount = Math.min(MAX_FLAKES, Math.max(MIN_FLAKES, count));
  return Array.from({ length: clampedCount }, () => createFlake(width, height));
}

export function moveFlakes(
  flakes: Flake[],
  width: number,
  height: number,
  deltaSeconds: number,
  timeSeconds: number,
): void {
  for (const flake of flakes) {
    const sway = Math.sin(timeSeconds * flake.swayFrequency + flake.phase) * flake.swayAmplitude;
    flake.y += flake.fallSpeed * deltaSeconds;
    flake.x += (WIND_SPEED + sway) * deltaSeconds;

    if (flake.y - flake.radius > height) {
      flake.y = -flake.radius;
      flake.x = Math.random() * width;
    }
    if (flake.x - flake.radius > width) flake.x = -flake.radius;
    if (flake.x + flake.radius < 0) flake.x = width + flake.radius;
  }
}

export function drawFlakes(
  context: CanvasRenderingContext2D,
  sprite: HTMLCanvasElement,
  flakes: Flake[],
  width: number,
  height: number,
): void {
  context.clearRect(0, 0, width, height);
  for (const flake of flakes) {
    const size = flake.radius * 2;
    context.globalAlpha = flake.opacity;
    context.drawImage(sprite, flake.x - flake.radius, flake.y - flake.radius, size, size);
  }
  context.globalAlpha = 1;
}
