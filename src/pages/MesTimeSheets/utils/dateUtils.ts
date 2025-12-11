// Utility to get French holidays
export const getFrenchHolidays = (year: number): string[] => {
  const holidays = [
    `${year}-01-01`, // Jour de l'an
    `${year}-05-01`, // Fête du travail
    `${year}-05-08`, // Victoire 1945
    `${year}-07-14`, // Fête nationale
    `${year}-08-15`, // Assomption
    `${year}-11-01`, // Toussaint
    `${year}-11-11`, // Armistice
    `${year}-12-25`, // Noël
  ];

  // Easter calculation (Meeus/Jones/Butcher algorithm)
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const easterMonth = Math.floor((h + l - 7 * m + 114) / 31);
  const easterDay = ((h + l - 7 * m + 114) % 31) + 1;

  const easterDate = new Date(year, easterMonth - 1, easterDay);

  // Easter Monday
  const easterMonday = new Date(easterDate);
  easterMonday.setDate(easterDate.getDate() + 1);
  holidays.push(toLocalISOString(easterMonday));

  // Ascension (39 days after Easter)
  const ascension = new Date(easterDate);
  ascension.setDate(easterDate.getDate() + 39);
  holidays.push(toLocalISOString(ascension));

  // Pentecost Monday (50 days after Easter)
  const pentecost = new Date(easterDate);
  pentecost.setDate(easterDate.getDate() + 50);
  holidays.push(toLocalISOString(pentecost));

  return holidays;
};

// Helper to get YYYY-MM-DD string matching the local date exactly
// This avoids ANY timezone offset issues by manually constructing the string
export const toLocalISOString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
};

export const isWorkingDay = (date: Date, holidays: string[]): boolean => {
  const dateString = toLocalISOString(date);
  return !isWeekend(date) && !holidays.includes(dateString);
};

export const getDaysInMonth = (month: number, year: number): Date[] => {
  const date = new Date(year, month - 1, 1);
  const days: Date[] = [];
  while (date.getMonth() === month - 1) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

export const formatDateFr = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "short", // Short month to save space in 2-col layout
  });
};
