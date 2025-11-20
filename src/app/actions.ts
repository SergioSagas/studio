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

// Using require for firebase-admin to avoid Next.js module resolution issues.
const admin = require('firebase-admin');

// --- Firebase Admin SDK Initialization ---
const VOTE_THRESHOLD = 3;

// Helper to initialize Firebase Admin SDK as a singleton.
const getAdminApp = () => {
  const appName = 'firebase-admin-app-actions';
  // Avoid re-initializing the app on every server action.
  const alreadyCreatedApp = admin.apps.find(
    (app: any) => app.name === appName
  );
  if (alreadyCreatedApp) {
    return alreadyCreatedApp;
  }
  // This simplified initialization works in App Hosting and local dev with service account env var
  return admin.initializeApp(
    {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    },
    appName
  );
};

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

// --- Reputation and Voting Logic ---
type ActionStateSimple = {
  status: 'success' | 'error';
  message: string;
};

const voteSchema = z.object({
  reportId: z.string(),
  voteType: z.enum(['confirm', 'dispute']),
  actionUserId: z.string(),
});

export async function castVoteAction(input: {
  reportId: string;
  voteType: 'confirm' | 'dispute';
  actionUserId: string;
}): Promise<ActionStateSimple> {
  const validatedFields = voteSchema.safeParse(input);
  if (!validatedFields.success) {
    return { status: 'error', message: 'Datos de votación inválidos.' };
  }
  
  const { reportId, voteType, actionUserId } = validatedFields.data;
  const adminDb = getAdminApp().firestore();
  
  const reportRef = adminDb.collection('incidentReports').doc(reportId);
  
  try {
    await adminDb.runTransaction(async (transaction: any) => {
      const reportDoc = await transaction.get(reportRef);
      if (!reportDoc.exists) {
        throw new Error('El reporte no existe.');
      }

      const report = reportDoc.data();
      const currentStatus = report.status || 'unverified';
      if (['confirmed', 'disputed', 'false'].includes(currentStatus)) {
        return; // This vote can no longer alter the outcome.
      }
      
      const confirmations = report.confirmations || [];
      const disputes = report.disputes || [];

      if (
        confirmations.includes(actionUserId) ||
        disputes.includes(actionUserId)
      ) {
        throw new Error('Ya has votado en este reporte.');
      }

      const newConfirmations =
        voteType === 'confirm'
          ? [...confirmations, actionUserId]
          : confirmations;
      const newDisputes =
        voteType === 'dispute' ? [...disputes, actionUserId] : disputes;

      transaction.update(reportRef, {
        confirmations: newConfirmations,
        disputes: newDisputes,
      });

      // Check if threshold is met AFTER the current vote
      const isConfirmed = newConfirmations.length >= VOTE_THRESHOLD;
      const isDisputed = newDisputes.length >= VOTE_THRESHOLD;

      if (isConfirmed || isDisputed) {
        const newStatus = isConfirmed ? 'confirmed' : 'disputed';
        transaction.update(reportRef, { status: newStatus });
        
        const authorRef = adminDb.collection('users').doc(report.userId);
        const authorDoc = await transaction.get(authorRef);
        
        if (authorDoc.exists) {
          const authorProfile = authorDoc.data();
          const currentReputation = authorProfile.reputation ?? 10;
          const reputationChange = isConfirmed ? 1 : -1;
          const newReputation = currentReputation + reputationChange;
          
          transaction.update(authorRef, { reputation: newReputation });
          
          const notificationType = isConfirmed ? 'report_confirmed' : 'report_disputed';
          const notificationMessage = isConfirmed
              ? `¡Tu reporte ha sido confirmado por la comunidad! Tu reputación ha subido a ${newReputation}.`
              : `Tu reporte ha sido disputado. Tu reputación ahora es ${newReputation}.`;

          const notificationsRef = authorRef.collection('notifications');
          transaction.create(notificationsRef.doc(), {
            message: notificationMessage,
            type: notificationType,
            timestamp: new Date().toISOString(),
            read: false,
            userId: report.userId,
          });
        }
      }
    });

    revalidatePath('/');
    revalidatePath('/alerts');

    return { status: 'success', message: 'Voto registrado exitosamente.' };
  } catch (error: any) {
    console.error("castVoteAction Error:", error);
    return {
      status: 'error',
      message: error.message || 'Ocurrió un error al procesar tu voto.',
    };
  }
}

const adminActionSchema = z.object({
  reportId: z.string(),
  newStatus: z.enum(['confirmed', 'false']),
  adminId: z.string(),
});

export async function handleAdminReportAction(input: {
  reportId: string;
  newStatus: 'confirmed' | 'false';
  adminId: string;
}): Promise<ActionStateSimple> {
  const validatedFields = adminActionSchema.safeParse(input);
  if (!validatedFields.success) {
    return { status: 'error', message: 'Datos de acción de admin inválidos.' };
  }

  const { reportId, newStatus } = validatedFields.data;
  const adminDb = getAdminApp().firestore();
  
  const reportRef = adminDb.collection('incidentReports').doc(reportId);
  const reportDoc = await reportRef.get();

  if (!reportDoc.exists) {
    return { status: 'error', message: 'El reporte no existe.' };
  }
  const report = reportDoc.data()!;
  
  if (report.status === newStatus) {
    return { status: 'error', message: `El reporte ya está marcado como ${newStatus}.` };
  }

  await reportRef.update({ status: newStatus });
  
  const authorRef = adminDb.collection('users').doc(report.userId);
  const authorDoc = await authorRef.get();
  if (authorDoc.exists) {
      const authorProfile = authorDoc.data()!;
      const currentReputation = authorProfile.reputation ?? 10;
      const reputationChange = newStatus === 'confirmed' ? 1 : -2;
      const newReputation = currentReputation + reputationChange;
      
      await authorRef.update({ reputation: newReputation });

      const eventType = newStatus === 'confirmed' ? 'report_confirmed' : 'reputation_loss';
      const notificationMessage = newStatus === 'confirmed'
          ? `¡Un administrador ha confirmado tu reporte! Tu reputación ha subido a ${newReputation}.`
          : `Un administrador marcó tu reporte como falso. Tu reputación ahora es ${newReputation}.`;

      await authorRef.collection('notifications').add({
        message: notificationMessage,
        type: eventType,
        timestamp: new Date().toISOString(),
        read: false,
        userId: report.userId,
      });
  }


  revalidatePath('/');
  revalidatePath('/alerts');
  return {
    status: 'success',
    message: `Reporte marcado como ${
      newStatus === 'confirmed' ? 'confirmado' : 'falso'
    }.`,
  };
}
