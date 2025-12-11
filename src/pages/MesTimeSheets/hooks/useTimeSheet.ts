import { useState, useEffect, useMemo } from "react";
import {
  Mission,
  Timesheet,
  TimeEntry,
  DayData,
  ActivityType,
} from "../types/types";
import { MissionService } from "../services/missionService";
import {
  getDaysInMonth,
  getFrenchHolidays,
  isWorkingDay,
  toLocalISOString,
} from "../utils/dateUtils";
import { calculateSplitWeeks } from "../utils/calendarLogic";

export const useTimeSheet = (
  missionId: string,
  year: number,
  month: number
) => {
  const [mission, setMission] = useState<Mission | null>(null);
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [stats, setStats] = useState({ workingDays: 0, totalLogged: 0 });

  const monthDays = useMemo(() => getDaysInMonth(month, year), [month, year]);
  const holidays = useMemo(() => getFrenchHolidays(year), [year]);
  const splitData = useMemo(
    () => calculateSplitWeeks(month, year),
    [month, year]
  );

  useEffect(() => {
    loadData();
  }, [missionId, year, month]);

  useEffect(() => {
    if (!timesheet) return;

    // Calculate working days in month
    let wDays = 0;
    monthDays.forEach((d) => {
      if (isWorkingDay(d, holidays)) wDays++;
    });

    // Calculate logged total
    let logged = 0;
    Object.values(timesheet.days).forEach((day: DayData) => {
      day.entries.forEach((e) => (logged += e.duration));
    });

    setStats({ workingDays: wDays, totalLogged: logged });
  }, [timesheet, monthDays, holidays]);

  const loadData = async () => {
    setLoading(true);

    if (missionId) {
      const allMissions = await MissionService.getMissions();
      const m = allMissions.find((x) => x.id === missionId);
      setMission(m || null);

      if (m) {
        let ts = await MissionService.getTimesheet(missionId, month, year);
        if (!ts) {
          ts = {
            id: crypto.randomUUID(),
            missionId: m.id,
            month,
            year,
            days: {},
          };
        }
        setTimesheet(ts);
      }
    }
    setLoading(false);
  };

  const updateEntry = (
    dateIso: string,
    index: number,
    field: keyof TimeEntry,
    value: any
  ) => {
    setTimesheet((prev) => {
      if (!prev) return null;

      const dayData = prev.days[dateIso] || { date: dateIso, entries: [] };
      const newEntries = [...dayData.entries];

      if (index === -1) {
        // Prevent adding more than 2
        if (newEntries.length >= 2) return prev;

        // Calculate smart default duration
        const currentTotal = newEntries.reduce((acc, e) => acc + e.duration, 0);
        const defaultDuration = currentTotal >= 0.5 ? 0.5 : 1.0;

        newEntries.push({
          type: ActivityType.MISSION,
          duration: defaultDuration,
          isTelework: false,
        });
      } else {
        newEntries[index] = { ...newEntries[index], [field]: value };
      }

      return {
        ...prev,
        days: {
          ...prev.days,
          [dateIso]: { date: dateIso, entries: newEntries },
        },
      };
    });
  };

  const removeEntry = (dateIso: string, index: number) => {
    setTimesheet((prev) => {
      if (!prev) return null;
      const dayData = prev.days[dateIso];
      if (!dayData) return prev;

      const newEntries = dayData.entries.filter((_, i) => i !== index);

      return {
        ...prev,
        days: {
          ...prev.days,
          [dateIso]: { date: dateIso, entries: newEntries },
        },
      };
    });
  };

  const handleAutoFill = () => {
    if (!timesheet) return;

    setTimesheet((prev) => {
      if (!prev) return null;

      const nextDays: Record<string, DayData> = { ...(prev.days || {}) };
      let filledCount = 0;

      monthDays.forEach((d) => {
        if (isWorkingDay(d, holidays)) {
          const dateIso = toLocalISOString(d);
          const dayData = nextDays[dateIso];
          const currentEntries = dayData?.entries || [];
          const currentTotal = currentEntries.reduce(
            (acc, e) => acc + e.duration,
            0
          );

          if (currentEntries.length === 0 || currentTotal === 0) {
            nextDays[dateIso] = {
              date: dateIso,
              entries: [
                {
                  type: ActivityType.MISSION,
                  duration: 1.0,
                  isTelework: false,
                },
              ],
            };
            filledCount++;
          }
        }
      });

      if (filledCount > 0) {
        setSaveMessage(`Remplissage effectué : ${filledCount} jours.`);
        setTimeout(() => setSaveMessage(null), 3000);
        return { ...prev, days: nextDays };
      } else {
        setSaveMessage("Aucun jour vide à remplir.");
        setTimeout(() => setSaveMessage(null), 3000);
        return prev;
      }
    });
  };

  const handleSave = async () => {
    if (timesheet) {
      await MissionService.saveTimesheet(timesheet);
      setSaveMessage("Sauvegardé avec succès !");
      setTimeout(() => setSaveMessage(null), 2000);
    }
  };

  return {
    mission,
    timesheet,
    loading,
    saveMessage,
    setSaveMessage,
    stats,
    holidays,
    monthDays,
    splitData,
    updateEntry,
    removeEntry,
    handleAutoFill,
    handleSave,
  };
};
