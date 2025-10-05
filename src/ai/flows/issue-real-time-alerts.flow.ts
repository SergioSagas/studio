'use server';
/**
 * @fileOverview Issues real-time alerts to community members based on the risk level of nearby incidents.
 *
 * - issueRealTimeAlerts - A function that determines if a real-time alert should be issued based on incident reports.
 * - IssueRealTimeAlertsInput - The input type for the issueRealTimeAlerts function.
 * - IssueRealTimeAlertsOutput - The return type for the issueRealTimeAlerts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IssueRealTimeAlertsInputSchema = z.object({
  incidentType: z
    .string()
    .describe("The type of incident (e.g., robbery, vandalism, noise, accident)."),
  location: z.string().describe('The location of the incident.'),
  time: z.string().describe('The time of the incident.'),
  riskLevel: z.enum(['low', 'medium', 'high']).describe('The risk level of the incident.'),
  reportDetails: z.string().describe('Details of the incident report.'),
});
export type IssueRealTimeAlertsInput = z.infer<typeof IssueRealTimeAlertsInputSchema>;

const IssueRealTimeAlertsOutputSchema = z.object({
  shouldAlert: z.boolean().describe('Whether a real-time alert should be issued.'),
  alertMessage: z.string().optional().describe('The message to send in the alert, if any.'),
});
export type IssueRealTimeAlertsOutput = z.infer<typeof IssueRealTimeAlertsOutputSchema>;

export async function issueRealTimeAlerts(input: IssueRealTimeAlertsInput): Promise<IssueRealTimeAlertsOutput> {
  return issueRealTimeAlertsFlow(input);
}

const issueRealTimeAlertsPrompt = ai.definePrompt({
  name: 'issueRealTimeAlertsPrompt',
  input: {schema: IssueRealTimeAlertsInputSchema},
  output: {schema: IssueRealTimeAlertsOutputSchema},
  prompt: `You are a safety expert analyzing incident reports to determine if a real-time alert should be issued to community members.

  Analyze the following incident report and determine if an alert should be issued based on the risk level, incident type, and location. Only issue alerts for medium and high risk incidents, except in special circumstances (e.g. repeated low risk incidents in the same location).

  Incident Type: {{{incidentType}}}
  Location: {{{location}}}
  Time: {{{time}}}
  Risk Level: {{{riskLevel}}}
  Report Details: {{{reportDetails}}}

  Consider the following:
  - Issue an alert if the risk level is high.
  - Issue an alert if the risk level is medium and the incident type is severe (e.g., robbery, assault).
  - Issue an alert if there have been multiple similar incidents in the same location recently, even if the risk level is low.
  - If the incident is minor (e.g., noise complaint, minor vandalism) and the risk level is low, do not issue an alert.

  If an alert should be issued, provide a concise and informative alert message that includes the incident type, location, and any necessary precautions. The alert message should be no more than 2 sentences.
  `,
});

const issueRealTimeAlertsFlow = ai.defineFlow(
  {
    name: 'issueRealTimeAlertsFlow',
    inputSchema: IssueRealTimeAlertsInputSchema,
    outputSchema: IssueRealTimeAlertsOutputSchema,
  },
  async input => {
    const {output} = await issueRealTimeAlertsPrompt(input);
    return output!;
  }
);
