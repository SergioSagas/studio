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
      incidentType: z.string().describe('Tipo de incidente (robo, vandalismo, ruido, accidente, etc.)'),
      location: z.string().describe('Ubicación del incidente'),
      time: z.string().describe('Hora del incidente'),
    })
  ).describe('Array de informes de incidentes'),
});

export type DetectCrimePatternsInput = z.infer<typeof DetectCrimePatternsInputSchema>;

const DetectCrimePatternsOutputSchema = z.object({
  patterns: z.array(
    z.object({
      zone: z.string().describe('Zona donde se detecta el patrón de delincuencia'),
      time: z.string().describe('Hora en que se detecta el patrón de delincuencia'),
      incidentTypes: z.array(z.string()).describe('Tipos de incidentes en el patrón'),
      frequency: z.number().describe('Frecuencia del patrón de delincuencia'),
    })
  ).describe('Array de patrones de delincuencia detectados'),
});

export type DetectCrimePatternsOutput = z.infer<typeof DetectCrimePatternsOutputSchema>;

export async function detectCrimePatterns(input: DetectCrimePatternsInput): Promise<DetectCrimePatternsOutput> {
  return detectCrimePatternsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectCrimePatternsPrompt',
  input: {schema: DetectCrimePatternsInputSchema},
  output: {schema: DetectCrimePatternsOutputSchema},
  prompt: `Eres un analista experto en criminología. Analiza los siguientes informes de incidentes para detectar patrones de delincuencia frecuentes por zona y hora.\n\nInformes de Incidentes:\n{{#each reports}}\n- Tipo: {{this.incidentType}}, Ubicación: {{this.location}}, Hora: {{this.time}}\n{{/each}}\n\nIdentifica patrones que incluyan zona, hora, tipos de incidentes y frecuencia.\n\nDevuelve los patrones de delincuencia detectados en formato JSON.`,
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
