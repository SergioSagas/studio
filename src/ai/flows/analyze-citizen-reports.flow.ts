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
  reportText: z.string().describe('The text content of the citizen report.'),
  reportAudioDataUri: z.string().optional().describe('The audio content of the citizen report, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'),
  reportImageDataUri: z.string().optional().describe('The image content of the citizen report, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'),
  reportVideoDataUri: z.string().optional().describe('The video content of the citizen report, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'),
  reportLocation: z.string().optional().describe('The GPS location or address of the incident.'),
});
export type AnalyzeCitizenReportInput = z.infer<typeof AnalyzeCitizenReportInputSchema>;

const AnalyzeCitizenReportOutputSchema = z.object({
  incidentType: z.string().describe('The classified type of incident (e.g., robbery, vandalism, noise, accident).'),
  riskLevel: z.enum(['low', 'medium', 'high']).describe('The assessed risk level of the incident.'),
  summary: z.string().describe('A brief summary of the incident.'),
});
export type AnalyzeCitizenReportOutput = z.infer<typeof AnalyzeCitizenReportOutputSchema>;

export async function analyzeCitizenReport(input: AnalyzeCitizenReportInput): Promise<AnalyzeCitizenReportOutput> {
  return analyzeCitizenReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCitizenReportPrompt',
  input: {schema: AnalyzeCitizenReportInputSchema},
  output: {schema: AnalyzeCitizenReportOutputSchema},
  prompt: `You are SafeCity Agent, an intelligent community assistant designed to enhance neighborhood safety by detecting, alerting, and preventing criminal incidents.
  Analyze the citizen report below to classify the incident type and risk level.

  Report Text: {{{reportText}}}
  {{#if reportAudioDataUri}}Report Audio: {{media url=reportAudioDataUri}}{{/if}}
  {{#if reportImageDataUri}}Report Image: {{media url=reportImageDataUri}}{{/if}}
  {{#if reportVideoDataUri}}Report Video: {{media url=reportVideoDataUri}}{{/if}}
  {{#if reportLocation}}Report Location: {{{reportLocation}}}{{/if}}

  Classify the incident type and risk level (low, medium, or high).
  Provide a brief summary of the incident.
  Remember to keep the summary anonymized of any sensitive information like names, addresses, or personal numbers.
  Output in JSON format:
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
