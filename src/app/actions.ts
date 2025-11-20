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
import { FieldValue } from 'firebase-admin/firestore';

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


// --- Lógica de Reputación y Votación ---

const getAdminApp = () => {
  const appName = 'firebase-admin-app-reputation';
  if (admin.apps.find(app => app?.name === appName)) {
    return admin.app(appName);
  }
  // Durante el desarrollo, GOOGLE_APPLICATION_CREDENTIALS debe estar configurado.
  // En producción en App Hosting, se inyectan automáticamente.
  return admin.initializeApp(
    {
      credential: admin.credential.applicationDefault(),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    },
    appName
  );
};


const voteSchema = z.object({
  reportId: z.string(),
  voteType: z.enum(['confirm', 'dispute']),
  actionUserId: z.string(),
});

type VoteState = {
  status: 'idle' | 'success' | 'error';
  message: string;
};

const VOTE_THRESHOLD = 3;

export async function castVoteAction(prevState: VoteState, formData: FormData): Promise<VoteState> {
  const validatedFields = voteSchema.safeParse({
    reportId: formData.get('reportId'),
    voteType: formData.get('voteType'),
    actionUserId: formData.get('actionUserId'),
  });

  if (!validatedFields.success) {
    return { status: 'error', message: 'Datos de votación inválidos.' };
  }

  const { reportId, voteType, actionUserId } = validatedFields.data;
  const adminApp = getAdminApp();
  const firestore = adminApp.firestore();
  const auth = adminApp.auth();

  try {
    const userRecord = await auth.getUser(actionUserId);
    const userRole = (await firestore.collection('users').doc(actionUserId).get()).data()?.role;

    const reportRef = firestore.collection('incidentReports').doc(reportId);
    
    await firestore.runTransaction(async (transaction) => {
      const reportDoc = await transaction.get(reportRef);
      if (!reportDoc.exists) {
        throw new Error('El reporte no existe.');
      }

      const report = reportDoc.data() as IncidentReport;
      const authorRef = firestore.collection('users').doc(report.userId);

      // --- Validaciones ---
      if (report.userId === actionUserId) {
        throw new Error('No puedes votar en tu propio reporte.');
      }
      if ((report.confirmations || []).includes(actionUserId) || (report.disputes || []).includes(actionUserId)) {
        throw new Error('Ya has votado en este reporte.');
      }

      // --- Aplicar Voto ---
      const voteField = voteType === 'confirm' ? 'confirmations' : 'disputes';
      transaction.update(reportRef, {
        [voteField]: FieldValue.arrayUnion(actionUserId),
      });

      // --- Lógica de Reputación y Estado ---
      const newConfirmations = voteType === 'confirm' ? (report.confirmations || []).length + 1 : (report.confirmations || []).length;
      const newDisputes = voteType === 'dispute' ? (report.disputes || []).length + 1 : (report.disputes || []).length;

      let reputationChange = 0;
      let newStatus: IncidentReport['status'] | null = null;
      
      // Lógica de confirmación
      if (report.status === 'unverified' && voteType === 'confirm') {
        if (userRole === 'admin') {
          newStatus = 'confirmed';
          reputationChange = 1;
        } else if (newConfirmations >= VOTE_THRESHOLD) {
          newStatus = 'confirmed';
          reputationChange = 1;
        }
      }

      // Lógica de disputa
      if (report.status === 'unverified' && voteType === 'dispute') {
        if (userRole === 'admin') {
          newStatus = 'false';
          reputationChange = -1;
        } else if (newDisputes >= VOTE_THRESHOLD) {
          newStatus = 'disputed'; // Aún no es "falso", sino "en disputa"
          // Opcional: reducir reputación por estar en disputa
        }
      }
      
      // Si un reporte ya confirmado es disputado por un admin
      if (report.status === 'confirmed' && voteType === 'dispute' && userRole === 'admin') {
          newStatus = 'false';
          reputationChange = -2; // Penalización mayor por reporte incorrecto previamente validado
      }


      if (newStatus) {
        transaction.update(reportRef, { status: newStatus });
      }
      if (reputationChange !== 0) {
        transaction.update(authorRef, {
          reputation: FieldValue.increment(reputationChange),
        });
      }
    });

    revalidatePath('/');
    revalidatePath('/alerts');
    return { status: 'success', message: 'Voto registrado exitosamente.' };

  } catch (error: any) {
    return { status: 'error', message: error.message || 'Ocurrió un error al registrar el voto.' };
  }
}
