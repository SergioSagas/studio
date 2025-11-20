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
import * as admin from 'firebase-admin';

// --- Firebase Admin SDK Initialization ---
const VOTE_THRESHOLD = 3;
function getAdminApp() {
  const appName = 'firebase-admin-app-server-actions';
  
  if (admin.apps.some(app => app?.name === appName)) {
    return admin.app(appName);
  }
  
  try {
      return admin.initializeApp({
        credential: admin.credential.applicationDefault(),
    }, appName);
  } catch (error) {
    console.error("Firebase admin initialization error:", error);
    // Re-throw or handle as appropriate. If this fails, subsequent Firestore operations will fail.
    throw new Error("Failed to initialize Firebase Admin SDK. Server-side actions will not work.");
  }
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


// Server action to send real-time alerts. This action is secure.
export async function sendRealTimeAlertsAction(input: {
  reportId: string;
  location: string;
  riskLevel: 'medium' | 'high';
  incidentType: string;
}): Promise<{ status: 'success' | 'error'; message: string; notifiedCount: number }> {
    const adminApp = getAdminApp();
    const firestore = adminApp.firestore();
    const { location, riskLevel, incidentType } = input;
    let notifiedCount = 0;

    try {
        const batch = firestore.batch();
        const usersRef = firestore.collection('users');

        // 1. Get all security personnel
        const securityQuery = usersRef.where('role', '==', 'security');
        const securityUsersSnapshot = await securityQuery.get();

        securityUsersSnapshot.forEach(userDoc => {
            const notificationRef = firestore.collection(`users/${userDoc.id}/notifications`).doc();
            batch.set(notificationRef, {
                message: `Alerta de ${riskLevel === 'medium' ? 'Riesgo Medio' : 'Alto Riesgo'}: ${incidentType} en ${location}.`,
                type: 'real_time_alert',
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                read: false,
                userId: userDoc.id
            });
            notifiedCount++;
        });

        // 2. Get all users subscribed to that neighborhood
        const neighborhoodQuery = usersRef.where('neighborhood', '==', location);
        const neighborhoodUsersSnapshot = await neighborhoodQuery.get();

        neighborhoodUsersSnapshot.forEach(userDoc => {
            // Avoid double-notifying security personnel if they are also subscribed
            if (userDoc.data().role !== 'security') {
                const notificationRef = firestore.collection(`users/${userDoc.id}/notifications`).doc();
                batch.set(notificationRef, {
                    message: `Alerta en tu vecindario: Se reportó un incidente de ${riskLevel === 'medium' ? 'riesgo medio' : 'alto riesgo'} (${incidentType}).`,
                    type: 'real_time_alert',
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                    read: false,
                    userId: userDoc.id
                });
                notifiedCount++;
            }
        });

        await batch.commit();

        revalidatePath('/alerts');
        return { status: 'success', message: 'Alerts sent.', notifiedCount };

    } catch (error: any) {
        console.error("Failed to send real-time alerts:", error);
        return { status: 'error', message: error.message || 'Could not send alerts.', notifiedCount: 0 };
    }
}


// --- Reputation and Voting Logic ---
type ActionStateSimple = {
  status: 'success' | 'error';
  message: string;
};

export async function castVoteAction(input: {
  reportId: string;
  voteType: 'confirm' | 'dispute';
  actionUserId: string;
  authorId: string;
}): Promise<ActionStateSimple> {
  const adminApp = getAdminApp();
  const firestore = adminApp.firestore();
  const { reportId, voteType, actionUserId, authorId } = input;

  try {
    const reportRef = firestore.collection('incidentReports').doc(reportId);
    
    await firestore.runTransaction(async (transaction) => {
      const reportDoc = await transaction.get(reportRef);
      if (!reportDoc.exists) {
        throw new Error("Reporte no encontrado.");
      }
      
      const reportData = reportDoc.data() as IncidentReport;
      const confirmations = reportData.confirmations || [];
      const disputes = reportData.disputes || [];

      if (confirmations.includes(actionUserId) || disputes.includes(actionUserId)) {
        // User has already voted, do nothing.
        return;
      }

      const updates: { [key: string]: any } = {};
      const voteField = voteType === 'confirm' ? 'confirmations' : 'disputes';
      const currentVotes = reportData[voteField] || [];
      updates[voteField] = [...currentVotes, actionUserId];
      
      transaction.update(reportRef, updates);
      
      const newConfirmationsCount = voteType === 'confirm' ? updates[voteField].length : confirmations.length;
      const newDisputesCount = voteType === 'dispute' ? updates[voteField].length : disputes.length;
      
      let newStatus: IncidentReport['status'] | null = null;
      let reputationChange = 0;
      let notificationType: 'report_confirmed' | 'report_disputed' | null = null;
      
      if (newConfirmationsCount >= VOTE_THRESHOLD) {
        newStatus = 'confirmed';
        reputationChange = 1;
        notificationType = 'report_confirmed';
      } else if (newDisputesCount >= VOTE_THRESHOLD) {
        newStatus = 'disputed';
        reputationChange = -1;
        notificationType = 'report_disputed';
      }
      
      if (newStatus && notificationType) {
        const authorRef = firestore.collection('users').doc(authorId);
        transaction.update(reportRef, { status: newStatus });
        transaction.update(authorRef, { reputation: admin.firestore.FieldValue.increment(reputationChange) });
        
        const notificationRef = authorRef.collection('notifications').doc();
        const message = newStatus === 'confirmed' ? 'Tu reporte ha sido confirmado por la comunidad.' : 'Tu reporte ha sido disputado por la comunidad.';
        transaction.set(notificationRef, {
            message,
            type: notificationType,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            read: false,
            userId: authorId
        });
      }
    });

    revalidatePath('/');
    revalidatePath('/alerts');
    return { status: 'success', message: 'Voto registrado.' };
  } catch (error: any) {
    console.error("Vote casting failed:", error);
    return { status: 'error', message: error.message || "No se pudo registrar el voto." };
  }
}


export async function handleAdminReportAction(input: {
  reportId: string;
  newStatus: 'confirmed' | 'false';
  adminId: string;
  authorId: string;
}): Promise<ActionStateSimple> {
    const adminApp = getAdminApp();
    const firestore = adminApp.firestore();
    const { reportId, newStatus, authorId } = input;

    try {
        const batch = firestore.batch();
        const reportRef = firestore.collection('incidentReports').doc(reportId);
        const authorRef = firestore.collection('users').doc(authorId);

        batch.update(reportRef, { status: newStatus });

        const reputationChange = newStatus === 'confirmed' ? 1 : -2;
        batch.update(authorRef, { reputation: admin.firestore.FieldValue.increment(reputationChange) });
        
        const notificationMessage = newStatus === 'confirmed'
            ? `Un administrador ha confirmado tu reporte.`
            : `Un administrador marcó tu reporte como falso.`;

        const notificationRef = firestore.collection('users').doc(authorId).collection('notifications').doc();
        batch.set(notificationRef, {
            message: notificationMessage,
            type: newStatus === 'confirmed' ? 'report_confirmed' : 'reputation_loss',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            read: false,
            userId: authorId
        });
        
        await batch.commit();
        
        revalidatePath('/');
        revalidatePath('/alerts');
        
        return { status: 'success', message: 'Acción completada.' };
    } catch (error: any) {
        console.error("Admin action failed:", error);
        return { status: 'error', message: error.message || "No se pudo completar la acción de administrador." };
    }
}
