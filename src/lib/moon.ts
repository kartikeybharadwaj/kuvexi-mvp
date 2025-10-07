// Simple moon-phase calculator + vibe/emoji map
export type MoonData = { phase: string; emoji: string; mood: string };

export function getTodayMoonData(): MoonData {
  const now = new Date();
  const synodic = 29.530588853; // days per lunar cycle
  const knownNew = new Date("2000-01-06T18:14:00Z").getTime();
  const days = (now.getTime() - knownNew) / 86400000;
  const phase = (days % synodic) / synodic;

  let result: MoonData;

  if (phase < 0.03 || phase > 0.97)
    result = { phase: "New Moon", emoji: "🌑", mood: "Time to reset" };
  else if (phase < 0.25)
    result = { phase: "Waxing Crescent", emoji: "🌒", mood: "Growing optimism" };
  else if (phase < 0.50)
    result = { phase: "First Quarter", emoji: "🌓", mood: "Take decisive action" };
  else if (phase < 0.75)
    result = { phase: "Full Moon", emoji: "🌕", mood: "Heightened emotions" };
  else
    result = { phase: "Waning Gibbous", emoji: "🌖", mood: "Reflect & release" };

  return result;
}
