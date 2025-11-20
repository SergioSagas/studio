// This file is machine-generated - edit with care!
'use server';
/**
 * @fileOverview Analyzes citizen reports to classify incident type and risk level.
 *
 * - analyzeCitizenReport - A function that handles the analysis of citizen reports.
 * - AnalyzeCitizenReportInput - The input type for the analyzeCitizenReport function.
 * - AnalyzeCitizenReportOutput - The return type for the analyzeCitizenReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCitizenReportInputSchema = z.object({
  reportText: z.string().describe('El contenido de texto del informe del ciudadano.'),
  reportAudioDataUri: z.string().optional().describe('El contenido de audio del informe del ciudadano, como un URI de datos que debe incluir un tipo MIME y usar codificación Base64. Formato esperado: \'data:<mimetype>;base64,<encoded_data>\'.'),
  reportImageDataUri: z.string().optional().describe('El contenido de imagen del informe del ciudadano, como un URI de datos que debe incluir un tipo MIME y usar codificación Base64. Formato esperado: \'data:<mimetype>;base64,<encoded_data>\'.'),
  reportVideoDataUri: z.string().optional().describe('El contenido de video del informe del ciudadano, como un URI de datos que debe incluir un tipo MIME y usar codificación Base64. Formato esperado: \'data:<mimetype>;base64,<encoded_data>\'.'),
  reportLocation: z.string().optional().describe('La ubicación GPS o dirección del incidente.'),
});
export type AnalyzeCitizenReportInput = z.infer<typeof AnalyzeCitizenReportInputSchema>;

const AnalyzeCitizenReportOutputSchema = z.object({
  incidentType: z.string().describe('El tipo de incidente clasificado (p. ej., robo, vandalismo, ataque animal, accidente).'),
  riskLevel: z.enum(['low', 'medium', 'high']).describe('El nivel de riesgo evaluado del incidente.'),
  summary: z.string().describe('Un breve resumen del incidente.'),
});
export type AnalyzeCitizenReportOutput = z.infer<typeof AnalyzeCitizenReportOutputSchema>;

export async function analyzeCitizenReport(input: AnalyzeCitizenReportInput): Promise<AnalyzeCitizenReportOutput> {
  return analyzeCitizenReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCitizenReportPrompt',
  input: {schema: AnalyzeCitizenReportInputSchema},
  output: {schema: AnalyzeCitizenReportOutputSchema},
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
  prompt: `Eres el Agente SafeCity, un asistente comunitario inteligente diseñado para mejorar la seguridad del vecindario al detectar, alertar y prevenir incidentes criminales.
  Analiza el informe ciudadano a continuación para clasificar el tipo de incidente y el nivel de riesgo.

  Texto del Informe: {{{reportText}}}
  {{#if reportAudioDataUri}}Audio del Informe: {{media url=reportAudioDataUri}}{{/if}}
  {{#if reportImageDataUri}}Imagen del Informe: {{media url=reportImageDataUri}}{{/if}}
  {{#if reportVideoDataUri}}Video del Informe: {{media url=reportVideoDataUri}}{{/if}}
  {{#if reportLocation}}Ubicación del Informe: {{{reportLocation}}}{{/if}}

  Clasifica el tipo de incidente y el nivel de riesgo (bajo, medio o alto). Si se describe un ataque de un animal, clasifícalo como 'Ataque de Animal'.
  Proporciona un breve resumen del incidente.
  Recuerda mantener el resumen anonimizado de cualquier información sensible como nombres, direcciones o números personales.
  Salida en formato JSON:
  {
    "incidentType": "",
    "riskLevel": "",
    "summary": ""
  }`,
});

const analyzeCitizenReportFlow = ai.defineFlow(
  {
    name: 'analyzeCitizenReportFlow',
    inputSchema: AnalyzeCitizenReportInputSchema,
    outputSchema: AnalyzeCitizenReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
