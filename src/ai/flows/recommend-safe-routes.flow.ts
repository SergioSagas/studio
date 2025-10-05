'use server';

/**
 * @fileOverview A safe route recommendation AI agent.
 *
 * - recommendSafeRoutes - A function that handles the safe route recommendation process.
 * - RecommendSafeRoutesInput - The input type for the recommendSafeRoutes function.
 * - RecommendSafeRoutesOutput - The return type for the recommendSafeRoutes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendSafeRoutesInputSchema = z.object({
  startLocation: z
    .string()
    .describe('La ubicación de inicio para la recomendación de ruta.'),
  endLocation: z
    .string()
    .describe('La ubicación de destino para la recomendación de ruta.'),
  transportMode: z
    .enum(['pedestrian', 'public_transport'])
    .describe('El modo de transporte (peatón o transporte público).'),
  incidentData: z.string().optional().describe('Datos opcionales sobre incidentes recientes en la zona.'),
});

export type RecommendSafeRoutesInput = z.infer<typeof RecommendSafeRoutesInputSchema>;

const RecommendSafeRoutesOutputSchema = z.object({
  safeRoutes: z.array(
    z.object({
      routeDescription: z.string().describe('Una descripción de la ruta recomendada.'),
      riskAssessment: z.string().describe('Una evaluación del nivel de seguridad/riesgo de la ruta.'),
    })
  ).describe('Rutas seguras recomendadas con evaluaciones de riesgo.'),
  overallRecommendation: z.string().describe('Una recomendación general para la ruta más segura.'),
});

export type RecommendSafeRoutesOutput = z.infer<typeof RecommendSafeRoutesOutputSchema>;

export async function recommendSafeRoutes(input: RecommendSafeRoutesInput): Promise<RecommendSafeRoutesOutput> {
  return recommendSafeRoutesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendSafeRoutesPrompt',
  input: {schema: RecommendSafeRoutesInputSchema},
  output: {schema: RecommendSafeRoutesOutputSchema},
  prompt: `Eres un asistente de IA diseñado para recomendar rutas seguras para los usuarios en función de sus ubicaciones de inicio y finalización especificadas, el modo de transporte y cualquier dato de incidente disponible.

  Dada la siguiente información, proporciona una lista de rutas seguras con evaluaciones de riesgo y una recomendación general:

  Ubicación de Inicio: {{{startLocation}}}
  Ubicación de Finalización: {{{endLocation}}}
  Modo de Transporte: {{{transportMode}}}

  {{#if incidentData}}
  Datos de Incidentes: {{{incidentData}}}
  {{else}}
  No hay datos de incidentes disponibles.
  {{/if}}

  Formatea tu salida como un objeto JSON con 'safeRoutes' (una matriz de rutas con descripciones y evaluaciones de riesgo) y 'overallRecommendation'. Cada descripción de ruta incluye indicaciones paso a paso o instrucciones de transporte público, y cada evaluación de riesgo explica los peligros potenciales y las medidas de seguridad. La recomendación general sintetiza esta información en una directiva única y clara.  
  `,
});

const recommendSafeRoutesFlow = ai.defineFlow(
  {
    name: 'recommendSafeRoutesFlow',
    inputSchema: RecommendSafeRoutesInputSchema,
    outputSchema: RecommendSafeRoutesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
