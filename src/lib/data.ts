export type IncidentReport = {
  id: string;
  incidentType: string;
  location: string;
  time: string;
  riskLevel: 'low' | 'medium' | 'high';
  summary: string;
};

export const incidentReports: IncidentReport[] = [
  {
    id: '1',
    incidentType: 'Vandalism',
    location: 'Oak Street Park',
    time: '2024-07-29 22:15:00',
    riskLevel: 'low',
    summary: 'Graffiti reported on park benches and walls.',
  },
  {
    id: '2',
    incidentType: 'Suspicious Activity',
    location: 'Main St & 2nd Ave',
    time: '2024-07-29 23:00:00',
    riskLevel: 'medium',
    summary:
      'An individual was reported looking into parked cars for an extended period.',
  },
  {
    id: '3',
    incidentType: 'Robbery',
    location: 'Elm Street, 400 block',
    time: '2024-07-28 21:45:00',
    riskLevel: 'high',
    summary: 'A pedestrian reported being mugged at knifepoint. Suspect fled on foot.',
  },
  {
    id: '4',
    incidentType: 'Noise Complaint',
    location: '123 Pine Ln',
    time: '2024-07-29 01:30:00',
    riskLevel: 'low',
    summary: 'Loud music reported from a residence.',
  },
  {
    id: '5',
    incidentType: 'Traffic Accident',
    location: 'Highway 101, Exit 45',
    time: '2024-07-28 17:50:00',
    riskLevel: 'medium',
    summary: 'Minor two-car collision, no injuries reported but causing traffic delays.',
  },
    {
    id: '6',
    incidentType: 'Vandalism',
    location: 'Oak Street Park',
    time: '2024-07-27 21:00:00',
    riskLevel: 'low',
    summary: 'A swing set was damaged in the children\'s play area.',
  },
    {
    id: '7',
    incidentType: 'Theft',
    location: 'Downtown Mall',
    time: '2024-07-29 15:00:00',
    riskLevel: 'high',
    summary: 'Shoplifting reported at a retail store. Suspect apprehended by security.',
  },
];
