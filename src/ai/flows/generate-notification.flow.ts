'use server';
/**
 * @fileOverview Generates a friendly notification message for reputation changes.
 *
 * - generateNotification - A function that creates a notification message.
 * - GenerateNotificationInput - The input type for the generateNotification function.
 * - GenerateNotificationOutput - The return type for the generateNotification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNotificationInputSchema = z.object({
  userName: z.string().describe("El nombre de pila del usuario que recibe la notificación."),
  eventType: z.enum(['reputation_gain', 'reputation_loss', 'report_confirmed', 'report_disputed']).describe("El tipo de evento que desencadenó la notificación."),
  newReputation: z.number().describe("El nuevo puntaje de reputación del usuario."),
});
export type GenerateNotificationInput = z.infer<typeof GenerateNotificationInputSchema>;

const GenerateNotificationOutputSchema = z.object({
  message: z.string().describe('El mensaje de notificación generado para el usuario.'),
});
export type GenerateNotificationOutput = z.infer<typeof GenerateNotificationOutputSchema>;

export async function generateNotification(input: GenerateNotificationInput): Promise<GenerateNotificationOutput> {
  return generateNotificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNotificationPrompt',
  input: {schema: GenerateNotificationInputSchema},
  output: {schema: GenerateNotificationOutputSchema},
  prompt: `Eres un asistente de comunidad amigable. Tu tarea es generar un mensaje de notificación corto y positivo para un usuario llamado {{{userName}}}.

El evento es: {{{eventType}}}.
Su nueva reputación es: {{{newReputation}}}.

- Si el evento es 'reputation_gain' o 'report_confirmed', el tono debe ser de felicitación.
- Si el evento es 'reputation_loss' o 'report_disputed', el tono debe ser informativo y alentador, no negativo.

Ejemplos:
- Gain: "¡Excelente trabajo, {{{userName}}}! Tu reputación ha subido a {{{newReputation}}} gracias a tus contribuciones."
- Loss: "{{{userName}}}, uno de tus reportes ha sido disputado. Tu reputación ahora es {{{newReputation}}}. ¡Sigue contribuyendo para mejorarla!"

Genera solo el mensaje.`,
});

const generateNotificationFlow = ai.defineFlow(
  {
    name: 'generateNotificationFlow',
    inputSchema: GenerateNotificationInputSchema,
    outputSchema: GenerateNotificationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
