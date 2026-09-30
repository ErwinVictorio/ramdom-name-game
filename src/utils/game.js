export function parseNames(input) {
  return input
    .split("\n")
    .map((name) => name.trim().replace(/\s+/g, " "))
    .filter(Boolean);
}

export function validateGame(names, duration) {
  if (names.length < 2) return "Please enter at least 2 participants.";
  if (names.length > 12) return "Please enter no more than 12 participants.";
  if (
    new Set(names.map((name) => name.toLocaleLowerCase())).size !== names.length
  ) {
    return "Duplicate names are not allowed (including different capitalization).";
  }
  if (
    !Number.isInteger(Number(duration)) ||
    Number(duration) < 3 ||
    Number(duration) > 30
  ) {
    return "Please select a whole number between 3 and 30 seconds.";
  }
  return "";
}

export function shuffleArray(array, random = Math.random) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
