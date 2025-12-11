import { getDaysInMonth } from "./dateUtils";

export const calculateSplitWeeks = (month: number, year: number) => {
  const monthDays = getDaysInMonth(month, year);

  if (monthDays.length === 0) {
    return {
      firstHalfDays: [],
      secondHalfDays: [],
      rightColumnOffset: 0,
      monthDays,
    };
  }

  // 1. Build Weeks (chunks of days)
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  monthDays.forEach((date) => {
    // If it's Monday and we have a current week (that isn't empty), push current and start new
    if (date.getDay() === 1 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(date);
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);

  // 2. Determine Split Point
  const totalWeeks = weeks.length;
  // Is the first week "complete" (starts on Monday)?
  const isFirstWeekFull = weeks[0][0].getDay() === 1;

  let splitIndex = 0;

  if (isFirstWeekFull) {
    // Rule: If 1st week is complete, tend to put MORE on the right
    splitIndex = Math.floor(totalWeeks / 2);
  } else {
    // Rule: If 1st week is incomplete, fill Left first
    splitIndex = Math.ceil(totalWeeks / 2);
  }

  const leftWeeks = weeks.slice(0, splitIndex);
  const rightWeeks = weeks.slice(splitIndex);

  // 3. Calculate Offset for Right Column
  let offset = 0;
  if (leftWeeks.length > 0) {
    // Check if first week is partial (doesn't start on Monday)
    if (leftWeeks[0][0].getDay() !== 1) {
      // The number of rows to skip is the length of this partial week
      offset = leftWeeks[0].length;
    }
  }

  return {
    firstHalfDays: leftWeeks.flat(),
    secondHalfDays: rightWeeks.flat(),
    rightColumnOffset: offset,
    monthDays,
  };
};
