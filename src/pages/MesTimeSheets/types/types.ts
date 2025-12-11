export interface Mission {
  id: string;
  user_id?: string; // Optional because created by backend mostly, but good to have
  nomMission: string;
  codeMission: string; // Used in timesheet activity

  // Prestataire
  prestataireNomEntreprise: string;
  prestataireVille: string;
  prestataireNom: string;
  prestatairePrenom: string;

  // SSII / Portage
  ssiNomEntreprise: string;
  ssiVille: string;
  ssiNomResponsable: string;
  ssiPrenomResponsable: string;

  // Client Final
  clientNomEntreprise: string;
  clientVille: string;
  clientNomResponsable: string;
  clientPrenomResponsable: string;

  created_at?: string;
  updated_at?: string;
}

export enum ActivityType {
  MISSION = "MISSION",
  CP = "CP", // Congés payés
  CSS = "CSS", // Congés sans solde
  RTT = "RTT",
  FORMATION = "FORMATION",
  INTERCONTRAT = "INTERCONTRAT",
  AUTRE = "AUTRE",
}

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  [ActivityType.MISSION]: "Mission / Production",
  [ActivityType.CP]: "Congés Payés",
  [ActivityType.CSS]: "Congés Sans Solde",
  [ActivityType.RTT]: "RTT",
  [ActivityType.FORMATION]: "Formation",
  [ActivityType.INTERCONTRAT]: "Intercontrat",
  [ActivityType.AUTRE]: "Autre",
};

export interface TimeEntry {
  type: ActivityType;
  duration: number; // 0.5 or 1
  isTelework: boolean;
}

export interface DayData {
  date: string; // ISO YYYY-MM-DD
  entries: TimeEntry[];
}

export interface Timesheet {
  id: string;
  user_id?: string;
  missionId: string;
  month: number; // 1-12
  year: number;
  days: Record<string, DayData>; // Key is YYYY-MM-DD
  created_at?: string;
  updated_at?: string;
}
