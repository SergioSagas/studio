export type IncidentReport = {
  id: string;
  userId: string;
  incidentType: string;
  description: string;
  location: string;
  riskLevel: 'low' | 'medium' | 'high';
  reportTime: string;
  summary: string;
};

// This data is now for type definition and backup purposes only.
// The app will fetch data directly from Firestore.
export const incidentReports: Omit<IncidentReport, 'id'>[] = [
  {
    userId: 'system',
    incidentType: 'Vandalism',
    description: 'Graffiti reported on park benches and walls.',
    location: 'Oak Street Park',
    reportTime: '2024-07-29T22:15:00.000Z',
    riskLevel: 'low',
    summary: 'Graffiti reported on park benches and walls.',
  },
  {
    userId: 'system',
    incidentType: 'Suspicious Activity',
    description: 'An individual was reported looking into parked cars for an extended period.',
    location: 'Main St & 2nd Ave',
    reportTime: '2024-07-29T23:00:00.000Z',
    riskLevel: 'medium',
    summary:
      'An individual was reported looking into parked cars for an extended period.',
  },
];
