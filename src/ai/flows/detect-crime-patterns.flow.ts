'use server';

/**
 * @fileOverview Detects frequent crime patterns by zone and time and provides a textual analysis.
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
      count: z.number().describe('Número de incidentes para este patrón específico.'),
    })
  ).describe('Array de patrones de delincuencia detectados.'),
  analysis: z.object({
    hotspots: z.array(z.string()).describe("Las 3 zonas con mayor frecuencia de incidentes, ordenadas de mayor a menor."),
    mainPattern: z.string().describe("Una descripción del patrón de delincuencia más recurrente (ej. 'Robos durante la noche en la zona X')."),
    recommendation: z.string().describe("Una recomendación de seguridad concisa y accionable basada en los patrones detectados.")
  }).describe("Análisis de texto generado por la IA sobre los patrones.")
});

export type DetectCrimePatternsOutput = z.infer<typeof DetectCrimePatternsOutputSchema>;

export async function detectCrimePatterns(input: DetectCrimePatternsInput): Promise<DetectCrimePatternsOutput> {
  return detectCrimePatternsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectCrimePatternsPrompt',
  input: {schema: DetectCrimePatternsInputSchema},
  output: {schema: DetectCrimePatternsOutputSchema},
  prompt: `Eres un analista experto en criminología. Analiza los siguientes informes de incidentes para detectar patrones y proporcionar un análisis cualitativo.

Informes de Incidentes:
{{#each reports}}
- Tipo: {{this.incidentType}}, Ubicación: {{this.location}}, Hora: {{this.time}}
{{/each}}

Tu tarea es doble:
1.  **Datos Estructurados (patterns):** Agrupa los incidentes por zona y tipo. Para cada zona, lista los tipos de incidentes y su conteo. Genera un objeto para cada combinación única de zona e incidente. Por ejemplo, si en "Buenos Aires" hay 5 robos y 2 vandalismos, debes generar dos objetos en el array 'patterns': uno para robos con count: 5 y otro para vandalismos con count: 2.
2.  **Análisis de Texto (analysis):** Basado en los datos, proporciona un análisis conciso:
    - **hotspots:** Identifica las 3 zonas con mayor número total de incidentes.
    - **mainPattern:** Describe el patrón más significativo que observes (el tipo de delito más común en la zona más peligrosa).
    - **recommendation:** Ofrece una recomendación de seguridad simple y clara.

Devuelve toda la información en el formato JSON especificado.`,
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
