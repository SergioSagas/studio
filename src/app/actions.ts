'use server';

import {
  analyzeCitizenReport,
  type AnalyzeCitizenReportOutput,
} from '@/ai/flows/analyze-citizen-reports.flow';
import {
  recommendSafeRoutes,
  type RecommendSafeRoutesOutput,
} from '@/ai/flows/recommend-safe-routes.flow';
import {
  detectCrimePatterns,
  type DetectCrimePatternsOutput,
} from '@/ai/flows/detect-crime-patterns.flow';
import type { IncidentReport } from '@/lib/data';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { cityData } from '@/lib/city-layout';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';

// Report Analysis Action
const reportSchema = z.object({
  reportText: z
    .string()
    .min(10, { message: 'El reporte debe tener al menos 10 caracteres.' }),
  location: z.string().min(1, { message: 'La ubicación es requerida.' }),
});

type ReportState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  data?: AnalyzeCitizenReportOutput;
  errors?: {
    reportText?: string[];
    location?: string[];
  };
};

export async function analyzeReportAction(
  prevState: ReportState,
  formData: FormData
): Promise<ReportState> {
  const validatedFields = reportSchema.safeParse({
    reportText: formData.get('reportText'),
    location: formData.get('location'),
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
    return {
      status: 'success',
      message: '¡Análisis de IA completado!',
      data: analysisResult,
    };
  } catch (error) {
    console.warn('AI analysis failed. Proceeding with pending state.', error);
    const pendingAnalysis: AnalyzeCitizenReportOutput = {
      incidentType: 'Sin clasificar',
      riskLevel: 'low',
      summary:
        'Análisis de IA pendiente. Un administrador revisará este reporte pronto.',
    };
    return {
      status: 'success',
      message: 'Análisis de IA falló, pero el reporte será guardado.',
      data: pendingAnalysis,
    };
  }
}

// Safe Routes Action
const routeSchema = z.object({
  startLocation: z
    .string()
    .min(1, { message: 'Se requiere la ubicación de inicio.' }),
  endLocation: z
    .string()
    .min(1, { message: 'Se requiere la ubicación final.' }),
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
    const cityLayoutString = `Mapa de la ciudad y conexiones: ${JSON.stringify(
      cityData.Mapa_Base_Nuevo_Chimbote
    )}`;
    const incidentData = `Informes recientes de robos cerca del Mercado Buenos Aires y vandalismo en el Parque 21 de Abril. Considera este mapa para las rutas: ${cityLayoutString}`;

    const result = await recommendSafeRoutes({
      ...validatedFields.data,
      incidentData,
    });
    revalidatePath('/routes');
    return {
      status: 'success',
      message: '¡Rutas seguras planeadas!',
      data: result,
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'La planificación de rutas de IA falló. Por favor, inténtalo de nuevo.',
    };
  }
}

// Crime Patterns Action
export async function fetchCrimePatternsAction(
  reports: Omit<IncidentReport, 'id'>[]
): Promise<DetectCrimePatternsOutput | null> {
  if (!reports || reports.length === 0) {
    return null;
  }

  const mappedReports = reports.map((r) => ({
    incidentType: r.incidentType,
    location: r.location,
    time: r.reportTime,
  }));

  try {
    const result = await detectCrimePatterns({ reports: mappedReports });
    return result;
  } catch (error) {
    console.error('Failed to detect crime patterns:', error);
    return null;
  }
}

function getAdminApp() {
    const appName = 'firebase-admin-app-server-actions';
    const existingApp = getApps().find(app => app?.name === appName);
    if (existingApp) {
        return existingApp;
    }

    // Check if the service account environment variable is set
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccount) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set. Server-side actions will not work.');
    }
    
    try {
        const serviceAccountJson = JSON.parse(serviceAccount);
        return initializeApp({
            credential: cert(serviceAccountJson),
        }, appName);
    } catch (error: any) {
        console.error("Firebase admin initialization error:", error.message);
        throw new Error("Failed to initialize Firebase Admin SDK from service account. Server-side actions will not work.");
    }
}


// Server action to get user IDs for real-time alerts. This action is secure.
export async function getUsersForAlertsAction(input: {
  location: string;
}): Promise<{ status: 'success' | 'error'; message: string; userIds: string[], securityIds: string[] }> {
    try {
        const adminApp = getAdminApp();
        const firestore = getFirestore(adminApp);
        const { location } = input;

        const securityIds: string[] = [];
        const userIds: string[] = [];
        
        const usersRef = firestore.collection('users');

        // 1. Get all security personnel
        const securityQuery = usersRef.where('role', '==', 'security');
        const securityUsersSnapshot = await securityQuery.get();
        securityUsersSnapshot.forEach(userDoc => {
            securityIds.push(userDoc.id);
        });

        // 2. Get all users subscribed to that neighborhood
        const neighborhoodQuery = usersRef.where('neighborhood', '==', location);
        const neighborhoodUsersSnapshot = await neighborhoodQuery.get();
        neighborhoodUsersSnapshot.forEach(userDoc => {
             // Avoid double-notifying security personnel if they are also subscribed
            if (userDoc.data().role !== 'security') {
                userIds.push(userDoc.id);
            }
        });
        
        return { status: 'success', message: 'Users fetched.', userIds, securityIds };

    } catch (error: any) {
        console.error("Failed to fetch users for alerts:", error);
        return { status: 'error', message: error.message || 'Could not fetch users for alerts.', userIds: [], securityIds: [] };
    }
}
