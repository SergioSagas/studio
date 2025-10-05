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
    .describe("El tipo de incidente (p. ej., robo, vandalismo, ruido, accidente)."),
  location: z.string().describe('La ubicación del incidente.'),
  time: z.string().describe('La hora del incidente.'),
  riskLevel: z.enum(['low', 'medium', 'high']).describe('El nivel de riesgo del incidente.'),
  reportDetails: z.string().describe('Detalles del informe del incidente.'),
});
export type IssueRealTimeAlertsInput = z.infer<typeof IssueRealTimeAlertsInputSchema>;

const IssueRealTimeAlertsOutputSchema = z.object({
  shouldAlert: z.boolean().describe('Si se debe emitir una alerta en tiempo real.'),
  alertMessage: z.string().optional().describe('El mensaje para enviar en la alerta, si corresponde.'),
});
export type IssueRealTimeAlertsOutput = z.infer<typeof IssueRealTimeAlertsOutputSchema>;

export async function issueRealTimeAlerts(input: IssueRealTimeAlertsInput): Promise<IssueRealTimeAlertsOutput> {
  return issueRealTimeAlertsFlow(input);
}

const issueRealTimeAlertsPrompt = ai.definePrompt({
  name: 'issueRealTimeAlertsPrompt',
  input: {schema: IssueRealTimeAlertsInputSchema},
  output: {schema: IssueRealTimeAlertsOutputSchema},
  prompt: `Eres un experto en seguridad que analiza informes de incidentes para determinar si se debe emitir una alerta en tiempo real a los miembros de la comunidad.

  Analiza el siguiente informe de incidente y determina si se debe emitir una alerta según el nivel de riesgo, el tipo de incidente y la ubicación. Solo emite alertas para incidentes de riesgo medio y alto, excepto en circunstancias especiales (p. ej., incidentes repetidos de bajo riesgo en la misma ubicación).

  Tipo de Incidente: {{{incidentType}}}
  Ubicación: {{{location}}}
  Hora: {{{time}}}
  Nivel de Riesgo: {{{riskLevel}}}
  Detalles del Reporte: {{{reportDetails}}}

  Considera lo siguiente:
  - Emite una alerta si el nivel de riesgo es alto.
  - Emite una alerta si el nivel de riesgo es medio y el tipo de incidente es grave (p. ej., robo, asalto).
  - Emite una alerta si ha habido múltiples incidentes similares en la misma ubicación recientemente, incluso si el nivel de riesgo es bajo.
  - Si el incidente es menor (p. ej., queja por ruido, vandalismo menor) y el nivel de riesgo es bajo, no emitas una alerta.

  Si se debe emitir una alerta, proporciona un mensaje de alerta conciso e informativo que incluya el tipo de incidente, la ubicación y las precauciones necesarias. El mensaje de alerta no debe tener más de 2 oraciones.
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
