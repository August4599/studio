// This is an AI-powered function that adjusts lighting parameters based on a user description.
'use server';
/**
 * @fileOverview Adjusts light source parameters in a 3D scene based on a user's descriptive request.
 *
 * - adjustLightingFromDescription - A function that adjusts lighting parameters based on a description.
 * - AdjustLightingFromDescriptionInput - The input type for the adjustLightingFromDescription function.
 * - AdjustLightingFromDescriptionOutput - The return type for the adjustLightingFromDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustLightingFromDescriptionInputSchema = z.object({
  description: z.string().describe('A description of the desired lighting (e.g., soft, diffuse light, bright, direct sunlight).'),
});

export type AdjustLightingFromDescriptionInput = z.infer<typeof AdjustLightingFromDescriptionInputSchema>;

const AdjustLightingFromDescriptionOutputSchema = z.object({
  ambientIntensity: z.number().describe('The intensity of the ambient light (0-1).'),
  directionalIntensity: z.number().describe('The intensity of the directional light (0-1).'),
  directionalDirection: z.object({
    x: z.number().describe('The x direction of the directional light (-1 to 1).'),
    y: z.number().describe('The y direction of the directional light (-1 to 1).'),
    z: z.number().describe('The z direction of the directional light (-1 to 1).'),
  }).describe('The direction of the directional light.'),
  shadowBias: z.number().describe('The shadow bias (0-1).'),
});

export type AdjustLightingFromDescriptionOutput = z.infer<typeof AdjustLightingFromDescriptionOutputSchema>;

export async function adjustLightingFromDescription(input: AdjustLightingFromDescriptionInput): Promise<AdjustLightingFromDescriptionOutput> {
  return adjustLightingFromDescriptionFlow(input);
}

const adjustLightingFromDescriptionPrompt = ai.definePrompt({
  name: 'adjustLightingFromDescriptionPrompt',
  input: {schema: AdjustLightingFromDescriptionInputSchema},
  output: {schema: AdjustLightingFromDescriptionOutputSchema},
  prompt: `You are an expert lighting designer for 3D scenes. Given the following description of desired lighting, you will suggest the correct ambient intensity, directional intensity, directional direction (x, y, z), and shadow bias values. Return the values as a JSON object.

Lighting description: {{{description}}}
`,
});

const adjustLightingFromDescriptionFlow = ai.defineFlow(
  {
    name: 'adjustLightingFromDescriptionFlow',
    inputSchema: AdjustLightingFromDescriptionInputSchema,
    outputSchema: AdjustLightingFromDescriptionOutputSchema,
  },
  async input => {
    const {output} = await adjustLightingFromDescriptionPrompt(input);
    return output!;
  }
);
