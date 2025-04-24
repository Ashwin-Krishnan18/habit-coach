import { Title, TITLE_THRESHOLDS } from "@shared/schema";

/**
 * Calculates the points needed for the next title based on current points
 */
export function calculatePointsToNextTitle(currentPoints: number): { nextTitle: Title | null; pointsNeeded: number } {
  const titles = Object.entries(TITLE_THRESHOLDS) as [Title, number][];
  const sortedTitles = titles.sort(([, a], [, b]) => a - b);
  
  // Find the next title based on current points
  for (let i = 0; i < sortedTitles.length; i++) {
    const [title, threshold] = sortedTitles[i];
    
    if (currentPoints < threshold) {
      return {
        nextTitle: title,
        pointsNeeded: threshold - currentPoints
      };
    }
  }
  
  // If we get here, the user has reached the highest title
  return {
    nextTitle: null,
    pointsNeeded: 0
  };
}

/**
 * Gets title for the given points
 */
export function getTitleForPoints(points: number): Title {
  const titles = Object.entries(TITLE_THRESHOLDS) as [Title, number][];
  const sortedTitles = titles.sort(([, a], [, b]) => b - a); // Sort in descending order
  
  // Find the highest title that the points qualify for
  for (const [title, threshold] of sortedTitles) {
    if (points >= threshold) {
      return title;
    }
  }
  
  // Default to lowest title
  return "New Explorer";
}
