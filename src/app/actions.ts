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
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { firebaseConfig } from '@/firebase/config';

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
    // In a real app, you might pass real incident data.
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

// Reputation Actions
type ReputationActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

// Helper to get the Firebase Admin SDK initialized
function getAdminApp(): App {
  const appName = 'firebase-admin-app-actions';
  const existingApp = getApps().find((app) => app.name === appName);
  if (existingApp) {
    return existingApp;
  }
  // This initialization is simplified to work in both local dev and App Hosting.
  // In App Hosting, environment variables are automatically picked up.
  // In local dev, it may fall back to other ADC mechanisms.
  return initializeApp({ projectId: firebaseConfig.projectId }, appName);
}

async function updateUserReputation(userId: string, change: number) {
  const firestore = getFirestore(getAdminApp());
  const userRef = firestore.collection('users').doc(userId);
  // Using Firestore's FieldValue.increment for atomic updates
  const { FieldValue } = await import('firebase-admin/firestore');
  await userRef.update({ reputation: FieldValue.increment(change) });
}

export async function confirmIncidentAction(
  incidentId: string,
  actionUserId: string,
  isAdminAction: boolean = false
): Promise<ReputationActionState> {
  const adminApp = getAdminApp();
  const firestore = getFirestore(adminApp);
  const auth = getAuth(adminApp);

  if (!actionUserId) {
    return {
      status: 'error',
      message: 'Debes iniciar sesión para confirmar un incidente.',
    };
  }
  
  const userRecord = await auth.getUser(actionUserId);
  const userDoc = await firestore.collection('users').doc(actionUserId).get();
  const userRole = userDoc.data()?.role;

  const incidentRef = firestore.collection('incidentReports').doc(incidentId);

  try {
    const incidentSnap = await incidentRef.get();
    if (!incidentSnap.exists) {
      return { status: 'error', message: 'El incidente no existe.' };
    }

    const incident = incidentSnap.data() as IncidentReport;
    if (incident.userId === actionUserId) {
      return { status: 'error', message: 'No puedes confirmar tu propio reporte.' };
    }

    if (
      (incident.confirmations || []).includes(actionUserId) ||
      (incident.disputes || []).includes(actionUserId)
    ) {
      return { status: 'error', message: 'Ya has votado en este reporte.' };
    }

    const batch = firestore.batch();
    const { FieldValue } = await import('firebase-admin/firestore');

    if (isAdminAction && userRole === 'admin') {
      batch.update(incidentRef, { status: 'confirmed' });
      if (incident.status !== 'confirmed') {
        // Use a separate function to avoid nested async/awaits inside the action
        await updateUserReputation(incident.userId, 1); // Admin confirmation gives 1 point
      }
    } else {
      const newConfirmations = [...(incident.confirmations || []), actionUserId];
      batch.update(incidentRef, { confirmations: newConfirmations });

      if (newConfirmations.length >= 3 && incident.status === 'unverified') {
        batch.update(incidentRef, { status: 'confirmed' });
        await updateUserReputation(incident.userId, 1);
      }
    }

    await batch.commit();

    revalidatePath('/');
    revalidatePath('/alerts');
    return { status: 'success', message: 'Incidente confirmado.' };
  } catch (e: any) {
    console.error('Error processing confirmation:', e);
    return {
      status: 'error',
      message: e.message || 'Ocurrió un error al procesar la confirmación.',
    };
  }
}

export async function disputeIncidentAction(
  incidentId: string,
  actionUserId: string,
  isAdminAction: boolean = false
): Promise<ReputationActionState> {
  const adminApp = getAdminApp();
  const firestore = getFirestore(adminApp);
  const auth = getAuth(adminApp);
  
  if (!actionUserId) {
    return {
      status: 'error',
      message: 'Debes iniciar sesión para disputar un incidente.',
    };
  }

  const userRecord = await auth.getUser(actionUserId);
  const userDoc = await firestore.collection('users').doc(actionUserId).get();
  const userRole = userDoc.data()?.role;
  
  const incidentRef = firestore.collection('incidentReports').doc(incidentId);

  try {
    const incidentSnap = await incidentRef.get();
    if (!incidentSnap.exists) {
      return { status: 'error', message: 'El incidente no existe.' };
    }

    const incident = incidentSnap.data() as IncidentReport;
    if (incident.userId === actionUserId) {
      return { status: 'error', message: 'No puedes disputar tu propio reporte.' };
    }

    if (
      (incident.confirmations || []).includes(actionUserId) ||
      (incident.disputes || []).includes(actionUserId)
    ) {
      return { status: 'error', message: 'Ya has votado en este reporte.' };
    }

    const batch = firestore.batch();
    const { FieldValue } = await import('firebase-admin/firestore');

    if (isAdminAction && userRole === 'admin') {
      batch.update(incidentRef, { status: 'false' });
      if (incident.status !== 'false') {
        await updateUserReputation(incident.userId, -2); // Admin dispute is a heavy penalty
      }
    } else {
      const newDisputes = [...(incident.disputes || []), actionUserId];
      batch.update(incidentRef, { disputes: newDisputes });

      if (newDisputes.length >= 3 && incident.status === 'unverified') {
        batch.update(incidentRef, { status: 'disputed' });
        await updateUserReputation(incident.userId, -1);
      }
    }

    await batch.commit();

    revalidatePath('/');
    revalidatePath('/alerts');
    return { status: 'success', message: 'Incidente disputado.' };
  } catch (e: any) {
    console.error('Error processing dispute:', e);
    return {
      status: 'error',
      message: e.message || 'Ocurrió un error al procesar la disputa.',
    };
  }
}
