import React from 'react';
import { Mission, Timesheet, ActivityType, ACTIVITY_LABELS } from '../types/types';
import { isWeekend, toLocalISOString } from '../utils/dateUtils';

interface TimeSheetPrintViewProps {
  mission: Mission;
  timesheet: Timesheet;
  monthDays: Date[];
  year: number;
  month: number;
  stats: {
    workingDays: number;
    totalLogged: number;
  };
  holidays: string[];
}

// Utilitaires de conversion pour tailles/textes (équivalents Tailwind → inline)
const px = (value: number) => `${value}px`;
const rem = (value: number) => `${value}rem`;

// Styles compatibles html2canvas (HEX uniquement, pas de oklch)
const styles: Record<string, React.CSSProperties> = {
  // Conteneur principal
  container: {
    width: '280mm',
    height: '180mm',
    margin: '0 auto',
    padding: '1rem',
    backgroundColor: '#ffffff',
    color: '#000000',
    display: 'none', // sera changé par le parent avant export
    fontFamily: 'Arial, sans-serif',
    fontSize: px(12),
    flexDirection: 'column',
    boxSizing: 'border-box',
  },

  // Bordures génériques
  borderBlack: {
    borderColor: '#000000',
    borderWidth: '1px',
    borderStyle: 'solid',
  },
  borderCell: {
    borderColor: '#000000',
    borderWidth: '0.5px',
    borderStyle: 'solid',
  },

  // Couleurs de fond (HEX seulement)
  bgBlueHeader: {
    backgroundColor: '#dbeafe', // blue-100
    borderColor: '#000000',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
  },
  bgBlueRow: {
    backgroundColor: '#93c5fd', // blue-300
  },
  bgBlueSeparator: {
    backgroundColor: '#dbeafe', // blue-100
  },
  bgGrayOff: {
    backgroundColor: '#d1d5db', // gray-300
  },
  bgGrayLight: {
    backgroundColor: '#f9fafb', // gray-50
  },

  // Texte
  textBlack: {
    color: '#000000',
  },
  textWhite: {
    color: '#ffffff',
  },

  // Layout utilitaires
  flexCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: px(16),
    marginBottom: px(32),
  },
  gridLabelValue: {
    display: 'grid',
    gridTemplateColumns: '85px 1fr',
    gap: px(8),
    padding: px(8),
  },
  centerText: {
    textAlign: 'center',
  },
  leftText: {
    textAlign: 'left',
  },
  rightText: {
    textAlign: 'right',
  },
  uppercase: {
    textTransform: 'uppercase',
  },
  fontWeightBold: {
    fontWeight: 'bold',
  },
  fontSizeSmall: {
    fontSize: px(12),
  },
  fontSizeXSmall: {
    fontSize: px(10),
  },
  fontSizeXXSmall: {
    fontSize: px(8),
  },
  fontSizeTT: {
    fontSize: px(6),
  },
  p2: {
    padding: px(8),
  },
  p05: {
    padding: px(2),
  },
  pl1: {
    paddingLeft: px(4),
  },
  pr2: {
    paddingRight: px(8),
  },
  h20: {
    height: rem(5),
  },
  h5: {
    height: px(20),
  },
  h6: {
    height: px(24),
  },
  w24: {
    width: px(96),
  },
  w18px: {
    width: px(18),
  },
  w10: {
    width: px(40),
  },
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: px(2),
  },
  absoluteTopLeft: {
    position: 'absolute',
    top: px(4),
    left: px(4),
  },
};

export const TimeSheetPrintView = React.forwardRef<HTMLDivElement, TimeSheetPrintViewProps>(
  ({ mission, timesheet, monthDays, year, month, stats, holidays }, ref) => {
    // Préparer les données
    const allActivities = Object.keys(ACTIVITY_LABELS) as ActivityType[];
    const sortedActivities = allActivities.sort((a, b) => {
      if (a === ActivityType.MISSION) return -1;
      if (b === ActivityType.MISSION) return 1;
      return a.localeCompare(b);
    });

    const totalByActivity: Record<string, number> = {};
    const totalByDay: Record<string, number> = {};

    sortedActivities.forEach(type => (totalByActivity[type] = 0));
    monthDays.forEach(d => {
      totalByDay[toLocalISOString(d)] = 0;
    });

    sortedActivities.forEach(type => {
      monthDays.forEach(d => {
        const iso = toLocalISOString(d);
        const entries = timesheet.days[iso]?.entries || [];
        const entry = entries.find(e => e.type === type);
        if (entry) {
          totalByActivity[type] += entry.duration;
          totalByDay[iso] += entry.duration;
        }
      });
    });

    const monthLabel = new Date(year, month - 1).toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });

    return (
      <div ref={ref} style={styles.container}>
        {/* HEADER */}
        <div style={{ marginBottom: px(64) }}>
          <h1
            style={{
              ...styles.textBlack,
              ...styles.fontWeightBold,
              ...styles.uppercase,
              ...styles.centerText,
              fontSize: px(18),
              marginBottom: px(40),
            }}
          >
            CRA - {monthLabel}
          </h1>

          <div style={styles.grid3}>
            {/* PRESTATAIRE */}
            <div style={{ ...styles.flexCol, ...styles.borderBlack }}>
              <h3
                style={{
                  ...styles.bgBlueHeader,
                  ...styles.fontWeightBold,
                  ...styles.uppercase,
                  ...styles.centerText,
                  ...styles.p2,
                }}
              >
                Prestataire
              </h3>
              <div style={styles.gridLabelValue}>
                <span style={styles.fontWeightBold}>Société:</span>
                <span>{mission.prestataireNomEntreprise}</span>
                <span style={styles.fontWeightBold}>Collaborateur:</span>
                <span>{mission.prestataireNom} {mission.prestatairePrenom}</span>
                <span style={styles.fontWeightBold}>Ville:</span>
                <span>{mission.prestataireVille}</span>
              </div>
            </div>

            {/* SSII */}
            <div style={{ ...styles.flexCol, ...styles.borderBlack }}>
              <h3
                style={{
                  ...styles.bgBlueHeader,
                  ...styles.fontWeightBold,
                  ...styles.uppercase,
                  ...styles.centerText,
                  ...styles.p2,
                }}
              >
                SSII / Portage
              </h3>
              <div style={styles.gridLabelValue}>
                <span style={styles.fontWeightBold}>Société:</span>
                <span>{mission.ssiNomEntreprise}</span>
                <span style={styles.fontWeightBold}>Responsable:</span>
                <span>{mission.ssiNomResponsable} {mission.ssiPrenomResponsable}</span>
                <span style={styles.fontWeightBold}>Ville:</span>
                <span>{mission.ssiVille}</span>
              </div>
            </div>

            {/* CLIENT FINAL */}
            <div style={{ ...styles.flexCol, ...styles.borderBlack }}>
              <h3
                style={{
                  ...styles.bgBlueHeader,
                  ...styles.fontWeightBold,
                  ...styles.uppercase,
                  ...styles.centerText,
                  ...styles.p2,
                }}
              >
                Client Final
              </h3>
              <div style={styles.gridLabelValue}>
                <span style={styles.fontWeightBold}>Société:</span>
                <span>{mission.clientNomEntreprise}</span>
                <span style={styles.fontWeightBold}>Responsable:</span>
                <span>{mission.clientNomResponsable} {mission.clientPrenomResponsable}</span>
                <span style={styles.fontWeightBold}>Mission:</span>
                <span>{mission.nomMission} ({mission.codeMission})</span>
                <span style={styles.fontWeightBold}>Ville:</span>
                <span>{mission.clientVille}</span>
              </div>
            </div>
          </div>
        </div>

        {/* PIVOT TABLE */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', margin: `${px(32)} 0` }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'center',
              tableLayout: 'fixed',
              fontSize: px(8),
              borderColor: '#000000',
              borderWidth: '1px',
              borderStyle: 'solid',
            }}
          >
            <thead>
              <tr style={styles.bgBlueRow}>
                <th style={{ ...styles.w24, ...styles.p05, ...styles.leftText, ...styles.pl1, ...styles.borderCell }}>
                  Postes
                </th>
                {monthDays.map(d => {
                  const iso = toLocalISOString(d);
                  const isOff = isWeekend(d) || holidays.includes(iso);
                  return (
                    <th
                      key={iso}
                      style={{
                        ...styles.w18px,
                        ...styles.p05,
                        ...styles.borderCell,
                        ...(isOff ? styles.bgGrayOff : {}),
                      }}
                    >
                      {d.getDate()}
                    </th>
                  );
                })}
                <th style={{ ...styles.w10, ...styles.p05, ...styles.borderCell }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {sortedActivities.map(type => {
                const isMission = type === ActivityType.MISSION;
                const row = (
                  <tr key={type} style={styles.h5}>
                    <td
                      style={{
                        ...styles.p05,
                        ...styles.leftText,
                        ...styles.pl1,
                        ...styles.borderCell,
                        fontWeight: 'bold',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {ACTIVITY_LABELS[type]}
                    </td>
                    {monthDays.map(d => {
                      const iso = toLocalISOString(d);
                      const isOff = isWeekend(d) || holidays.includes(iso);
                      const entry = timesheet.days[iso]?.entries?.find(e => e.type === type);
                      return (
                        <td
                          key={iso}
                          style={{
                            ...styles.p05,
                            ...styles.borderCell,
                            ...(isOff ? styles.bgGrayOff : {}),
                            position: 'relative',
                          }}
                        >
                          {entry && entry.duration > 0 ? (
                            <div style={styles.flexCenter}>
                              <span>{entry.duration}</span>
                              {entry.isTelework && (
                                <span
                                  style={{
                                    ...styles.textWhite,
                                    ...styles.fontSizeTT,
                                    backgroundColor: '#000000',
                                    padding: `${px(1)} ${px(2)}`,
                                    borderRadius: px(2),
                                    lineHeight: 1,
                                  }}
                                >
                                  TT
                                </span>
                              )}
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                    <td style={{ ...styles.p05, ...styles.borderCell, fontWeight: 'bold' }}>
                      {totalByActivity[type] > 0 ? totalByActivity[type] : ''}
                    </td>
                  </tr>
                );

                if (isMission) {
                  return (
                    <React.Fragment key={type}>
                      <tr style={{ ...styles.h6, height: px(24) }}>
                        <td
                          colSpan={monthDays.length + 2}
                          style={{
                            ...styles.bgBlueSeparator,
                            borderLeft: '1px solid #000000',
                            borderRight: '1px solid #000000',
                          }}
                        ></td>
                      </tr>
                      {row}
                      <tr style={{ ...styles.h6, height: px(24) }}>
                        <td
                          colSpan={monthDays.length + 2}
                          style={{
                            ...styles.bgBlueSeparator,
                            borderLeft: '1px solid #000000',
                            borderRight: '1px solid #000000',
                          }}
                        ></td>
                      </tr>
                    </React.Fragment>
                  );
                }
                return row;
              })}
              <tr style={{ ...styles.h6, ...styles.bgBlueSeparator, fontWeight: 'bold' }}>
                <td style={{ ...styles.p05, ...styles.rightText, ...styles.pr2, ...styles.borderCell }}>TOTAL</td>
                {monthDays.map(d => {
                  const iso = toLocalISOString(d);
                  const isOff = isWeekend(d) || holidays.includes(iso);
                  const val = totalByDay[iso];
                  return (
                    <td
                      key={iso}
                      style={{
                        ...styles.p05,
                        ...styles.borderCell,
                        ...(isOff ? styles.bgGrayOff : {}),
                      }}
                    >
                      {val > 0 ? val : ''}
                    </td>
                  );
                })}
                <td style={{ ...styles.p05, ...styles.borderCell, fontSize: px(10) }}>{stats.totalLogged}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div style={{ marginTop: px(32), ...styles.fontSizeSmall, breakInside: 'avoid' }}>
          <div style={{ marginBottom: px(8) }}>
            <strong>Fait le :</strong> {new Date().toLocaleDateString('fr-FR')}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: px(32) }}>
            {/* Prestataire */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: px(8) }}>
              <div>
                <p style={{ ...styles.fontWeightBold, marginBottom: px(4) }}>Commentaire Prestataire :</p>
                <div style={{ ...styles.h20, ...styles.borderBlack, ...styles.bgGrayLight }}></div>
              </div>
              <div style={{ ...styles.h20, ...styles.borderBlack, position: 'relative', padding: px(8) }}>
                <p style={{ ...styles.fontSizeXSmall, ...styles.uppercase, ...styles.fontWeightBold, ...styles.absoluteTopLeft }}>
                  Signature Prestataire
                </p>
              </div>
            </div>

            {/* Client */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: px(8) }}>
              <div>
                <p style={{ ...styles.fontWeightBold, marginBottom: px(4) }}>Commentaire Client :</p>
                <div style={{ ...styles.h20, ...styles.borderBlack, ...styles.bgGrayLight }}></div>
              </div>
              <div style={{ ...styles.h20, ...styles.borderBlack, position: 'relative', padding: px(8) }}>
                <p style={{ ...styles.fontSizeXSmall, ...styles.uppercase, ...styles.fontWeightBold, ...styles.absoluteTopLeft }}>
                  Signature Client / SSII
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

TimeSheetPrintView.displayName = 'TimeSheetPrintView';