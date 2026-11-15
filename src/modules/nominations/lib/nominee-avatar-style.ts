const COLD_HUE_START = 180;
const COLD_HUE_RANGE = 70;

// "Aurora_Lynx" → "AL", "frostbyte" → "FR"
export function getInitials(name: string): string {
  const words = name.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  const firstWord = words[0] ?? '';
  const secondWord = words[1];
  const initials = secondWord ? firstWord[0] + secondWord[0] : firstWord.slice(0, 2);
  return initials.toUpperCase();
}

// Stable cold-palette gradient per nominee, so the placeholder avatar never changes.
export function getAvatarGradient(seed: string): string {
  const hash = [...seed].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 9973, 7);
  const hue = COLD_HUE_START + (hash % COLD_HUE_RANGE);
  return `linear-gradient(135deg, hsl(${hue} 85% 72%), hsl(${hue + 40} 70% 42%))`;
}
