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
  location: z.string().min(1, { message: 'La ubicación es requerida.' }),
  userId: z.string().min(1, { message: 'Usuario no autenticado.' }),
});

type ReportState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  data?: AnalyzeCitizenReportOutput;
  errors?: {
    reportText?: string[];
    location?: string[];
    userId?: string[];
  };
};

export async function analyzeReportAction(
  prevState: ReportState,
  formData: FormData
): Promise<ReportState> {
    
  const validatedFields = reportSchema.safeParse({
    reportText: formData.get('reportText'),
    location: formData.get('location'),
    userId: formData.get('userId'),
  });

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: 'Datos de formulario inválidos.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { reportText, location } = validatedFields.data;

  try {
    const analysisResult = await analyzeCitizenReport({
      reportText: reportText,
      reportLocation: location,
    });
    return { status: 'success', message: '¡Análisis de IA completado!', data: analysisResult };
  } catch (error) {
    console.warn("AI analysis failed. Proceeding with pending state.", error);
    const pendingAnalysis: AnalyzeCitizenReportOutput = {
      incidentType: 'Sin clasificar',
      riskLevel: 'low',
      summary: 'Análisis de IA pendiente. Un administrador revisará este reporte pronto.',
    };
    return { status: 'success', message: 'Análisis de IA falló, pero el reporte será guardado.', data: pendingAnalysis };
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
export async function fetchCrimePatternsAction(reports: Omit<IncidentReport, 'id'>[]): Promise<DetectCrimePatternsOutput | null> {
    if (!reports || reports.length === 0) {
        return null;
    }
    
    const mappedReports = reports.map(r => ({
      incidentType: r.incidentType,
      location: r.location,
      time: r.reportTime,
    }));

    try {
        const result = await detectCrimePatterns({ reports: mappedReports });
        return result;
    } catch (error) {
        console.error("Failed to detect crime patterns:", error);
        return null;
    }
}
