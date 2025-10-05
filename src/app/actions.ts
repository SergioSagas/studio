'use server';

import {
  analyzeCitizenReport,
  type AnalyzeCitizenReportOutput,
} from '@/ai/flows/analyze-citizen-reports.flow';
import {
  recommendSafeRoutes,
  type RecommendSafeRoutesOutput,
} from '@/ai/flows/recommend-safe-routes.flow';
import { detectCrimePatterns, type DetectCrimePatternsOutput } from '@/ai/flows/detect-crime-patterns.flow';
import type { IncidentReport } from '@/lib/data';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// Report Analysis Action
const reportSchema = z.object({
  reportText: z
    .string()
    .min(10, { message: 'El reporte debe tener al menos 10 caracteres.' }),
});

type ReportState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  data?: AnalyzeCitizenReportOutput;
  errors?: {
    reportText?: string[];
  };
};

export async function analyzeReportAction(
  prevState: ReportState,
  formData: FormData
): Promise<ReportState> {
  const validatedFields = reportSchema.safeParse({
    reportText: formData.get('reportText'),
  });

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: 'Datos de formulario inválidos.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await analyzeCitizenReport({
      reportText: validatedFields.data.reportText,
    });
    revalidatePath('/report');
    return { status: 'success', message: '¡Reporte analizado con éxito!', data: result };
  } catch (error) {
    return { status: 'error', message: 'El análisis de IA falló. Por favor, inténtalo de nuevo.' };
  }
}

// Safe Routes Action
const routeSchema = z.object({
  startLocation: z.string().min(3, { message: 'Se requiere la ubicación de inicio.' }),
  endLocation: z.string().min(3, { message: 'Se requiere la ubicación final.' }),
  transportMode: z.enum(['pedestrian', 'public_transport']),
});

type RouteState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  data?: RecommendSafeRoutesOutput;
  errors?: {
    startLocation?: string[];
    endLocation?: string[];
    transportMode?: string[];
  };
};

export async function planSafeRoutesAction(
  prevState: RouteState,
  formData: FormData
): Promise<RouteState> {
  const validatedFields = routeSchema.safeParse({
    startLocation: formData.get('startLocation'),
    endLocation: formData.get('endLocation'),
    transportMode: formData.get('transportMode'),
  });

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: 'Datos de formulario inválidos.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    // In a real app, you might pass real incident data.
    const result = await recommendSafeRoutes({ ...validatedFields.data, incidentData: "Informes recientes de robos cerca del Centro Comercial del Centro y vandalismo en el Parque Oak Street." });
    revalidatePath('/routes');
    return { status: 'success', message: '¡Rutas seguras planeadas!', data: result };
  } catch (error) {
    return { status: 'error', message: 'La planificación de rutas de IA falló. Por favor, inténtalo de nuevo.' };
  }
}

// Crime Patterns Action
export async function fetchCrimePatternsAction(reports: IncidentReport[]): Promise<DetectCrimePatternsOutput | null> {
    if (!reports || reports.length === 0) {
        return null;
    }

    try {
        const result = await detectCrimePatterns({ reports });
        return result;
    } catch (error) {
        console.error("Failed to detect crime patterns:", error);
        return null;
    }
}
