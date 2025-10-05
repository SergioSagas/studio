'use server';

/**
 * @fileOverview Detects frequent crime patterns by zone and time.
 *
 * - detectCrimePatterns - A function that handles the detection of crime patterns.
 * - DetectCrimePatternsInput - The input type for the detectCrimePatterns function.
 * - DetectCrimePatternsOutput - The return type for the detectCrimePatterns function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectCrimePatternsInputSchema = z.object({
  reports: z.array(
    z.object({
      incidentType: z.string().describe('Type of incident (robbery, vandalism, noise, accident, etc.)'),
      location: z.string().describe('Location of the incident'),
      time: z.string().describe('Time of the incident'),
    })
  ).describe('Array of incident reports'),
});

export type DetectCrimePatternsInput = z.infer<typeof DetectCrimePatternsInputSchema>;

const DetectCrimePatternsOutputSchema = z.object({
  patterns: z.array(
    z.object({
      zone: z.string().describe('Zone where the crime pattern is detected'),
      time: z.string().describe('Time when the crime pattern is detected'),
      incidentTypes: z.array(z.string()).describe('Types of incidents in the pattern'),
      frequency: z.number().describe('Frequency of the crime pattern'),
    })
  ).describe('Array of detected crime patterns'),
});

export type DetectCrimePatternsOutput = z.infer<typeof DetectCrimePatternsOutputSchema>;

export async function detectCrimePatterns(input: DetectCrimePatternsInput): Promise<DetectCrimePatternsOutput> {
  return detectCrimePatternsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectCrimePatternsPrompt',
  input: {schema: DetectCrimePatternsInputSchema},
  output: {schema: DetectCrimePatternsOutputSchema},
  prompt: `You are an expert crime analyst. Analyze the following incident reports to detect frequent crime patterns by zone and time.\n\nIncident Reports:\n{{#each reports}}\n- Type: {{this.incidentType}}, Location: {{this.location}}, Time: {{this.time}}\n{{/each}}\n\nIdentify patterns including zone, time, incident types and frequency.\n\nReturn the detected crime patterns in JSON format.`,
});

const detectCrimePatternsFlow = ai.defineFlow(
  {
    name: 'detectCrimePatternsFlow',
    inputSchema: DetectCrimePatternsInputSchema,
    outputSchema: DetectCrimePatternsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
