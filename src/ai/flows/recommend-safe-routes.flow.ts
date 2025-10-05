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
    .describe('The starting location for the route recommendation.'),
  endLocation: z
    .string()
    .describe('The destination location for the route recommendation.'),
  transportMode: z
    .enum(['pedestrian', 'public_transport'])
    .describe('The mode of transportation (pedestrian or public transport).'),
  incidentData: z.string().optional().describe('Optional data on recent incidents in the area.'),
});

export type RecommendSafeRoutesInput = z.infer<typeof RecommendSafeRoutesInputSchema>;

const RecommendSafeRoutesOutputSchema = z.object({
  safeRoutes: z.array(
    z.object({
      routeDescription: z.string().describe('A description of the recommended route.'),
      riskAssessment: z.string().describe('An assessment of the safety/risk level of the route.'),
    })
  ).describe('Recommended safe routes with risk assessments.'),
  overallRecommendation: z.string().describe('An overall recommendation for the safest route.'),
});

export type RecommendSafeRoutesOutput = z.infer<typeof RecommendSafeRoutesOutputSchema>;

export async function recommendSafeRoutes(input: RecommendSafeRoutesInput): Promise<RecommendSafeRoutesOutput> {
  return recommendSafeRoutesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendSafeRoutesPrompt',
  input: {schema: RecommendSafeRoutesInputSchema},
  output: {schema: RecommendSafeRoutesOutputSchema},
  prompt: `You are an AI assistant designed to recommend safe routes for users based on their specified start and end locations, mode of transportation, and any available incident data.

  Given the following information, provide a list of safe routes with risk assessments and an overall recommendation:

  Start Location: {{{startLocation}}}
  End Location: {{{endLocation}}}
  Mode of Transportation: {{{transportMode}}}

  {{#if incidentData}}
  Incident Data: {{{incidentData}}}
  {{else}}
  No incident data available.
  {{/if}}

  Format your output as a JSON object with 'safeRoutes' (an array of routes with descriptions and risk assessments) and 'overallRecommendation'. Each route description includes turn-by-turn directions or public transport instructions, and each risk assessment explains the potential dangers and safety measures. The overall recommendation synthesizes this information into a single, clear directive.  
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
