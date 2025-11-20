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
import { cityData } from '@/lib/city-layout';
import { getFirestore, doc, getDoc, updateDoc, increment, writeBatch } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/index';
import { cookies } from 'next/headers';
import { getAuth } from 'firebase/auth';


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
  startLocation: z.string().min(1, { message: 'Se requiere la ubicación de inicio.' }),
  endLocation: z.string().min(1, { message: 'Se requiere la ubicación final.' }),
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
    const cityLayoutString = `Mapa de la ciudad y conexiones: ${JSON.stringify(cityData.Mapa_Base_Nuevo_Chimbote)}`;
    const incidentData = `Informes recientes de robos cerca del Mercado Buenos Aires y vandalismo en el Parque 21 de Abril. Considera este mapa para las rutas: ${cityLayoutString}`;

    const result = await recommendSafeRoutes({ ...validatedFields.data, incidentData });
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


// Reputation Actions
type ReputationActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

const getUserId = async (): Promise<string | null> => {
    // This is a simplified way to get the user ID on the server.
    // In a real app, you would get this from your server-side session management.
    // For this prototype, we'll assume the client sends it or we get it from a simulated session.
    // The most reliable way with Firebase is to verify an ID token sent from the client.
    // However, for simplicity, let's assume we can get it from the auth object.
    const { auth } = initializeFirebase();
    return auth.currentUser?.uid || null;
}

async function updateUserReputation(userId: string, change: number) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', userId);
    await updateDoc(userRef, { reputation: increment(change) });
}

export async function confirmIncidentAction(incidentId: string, isAdminAction: boolean = false): Promise<ReputationActionState> {
    const { firestore } = initializeFirebase();
    const { auth } = initializeFirebase();
    const userId = auth.currentUser?.uid;
    const userRole = auth.currentUser ? (await getDoc(doc(firestore, 'users', auth.currentUser.uid))).data()?.role : null;


    if (!userId) {
        return { status: 'error', message: 'Debes iniciar sesión para confirmar un incidente.' };
    }

    const incidentRef = doc(firestore, 'incidentReports', incidentId);
    
    try {
        const incidentSnap = await getDoc(incidentRef);
        if (!incidentSnap.exists()) {
            return { status: 'error', message: 'El incidente no existe.' };
        }

        const incident = incidentSnap.data() as IncidentReport;
        if (incident.userId === userId) {
            return { status: 'error', message: 'No puedes confirmar tu propio reporte.' };
        }

        if (incident.confirmations.includes(userId) || incident.disputes.includes(userId)) {
            return { status: 'error', message: 'Ya has votado en este reporte.' };
        }
        
        const batch = writeBatch(firestore);
        
        if (isAdminAction && userRole === 'admin') {
            batch.update(incidentRef, { status: 'confirmed' });
            if (incident.status !== 'confirmed') {
                updateUserReputation(incident.userId, 1); // Admin confirmation gives 1 point
            }
        } else {
            const newConfirmations = [...incident.confirmations, userId];
            batch.update(incidentRef, { confirmations: newConfirmations });

            if (newConfirmations.length >= 3 && incident.status === 'unverified') {
                batch.update(incidentRef, { status: 'confirmed' });
                updateUserReputation(incident.userId, 1);
            }
        }
        
        await batch.commit();

        revalidatePath('/');
        revalidatePath('/alerts');
        return { status: 'success', message: 'Incidente confirmado.' };

    } catch (e) {
        return { status: 'error', message: 'Ocurrió un error al procesar la confirmación.' };
    }
}


export async function disputeIncidentAction(incidentId: string, isAdminAction: boolean = false): Promise<ReputationActionState> {
    const { firestore } = initializeFirebase();
    const { auth } = initializeFirebase();
    const userId = auth.currentUser?.uid;
    const userRole = auth.currentUser ? (await getDoc(doc(firestore, 'users', auth.currentUser.uid))).data()?.role : null;

    if (!userId) {
        return { status: 'error', message: 'Debes iniciar sesión para disputar un incidente.' };
    }

    const incidentRef = doc(firestore, 'incidentReports', incidentId);
    
    try {
        const incidentSnap = await getDoc(incidentRef);
        if (!incidentSnap.exists()) {
            return { status: 'error', message: 'El incidente no existe.' };
        }

        const incident = incidentSnap.data() as IncidentReport;
        if (incident.userId === userId) {
            return { status: 'error', message: 'No puedes disputar tu propio reporte.' };
        }

        if (incident.confirmations.includes(userId) || incident.disputes.includes(userId)) {
            return { status: 'error', message: 'Ya has votado en este reporte.' };
        }
        
        const batch = writeBatch(firestore);

        if (isAdminAction && userRole === 'admin') {
             batch.update(incidentRef, { status: 'false' });
             if (incident.status !== 'false') {
                updateUserReputation(incident.userId, -2); // Admin dispute is a heavy penalty
             }
        } else {
            const newDisputes = [...incident.disputes, userId];
            batch.update(incidentRef, { disputes: newDisputes });

            if (newDisputes.length >= 3 && incident.status === 'unverified') {
                batch.update(incidentRef, { status: 'disputed' });
                updateUserReputation(incident.userId, -1);
            }
        }

        await batch.commit();

        revalidatePath('/');
        revalidatePath('/alerts');
        return { status: 'success', message: 'Incidente disputado.' };
    } catch (e) {
        return { status: 'error', message: 'Ocurrió un error al procesar la disputa.' };
    }
}
