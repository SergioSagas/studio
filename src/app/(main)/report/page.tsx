'use client';

import { PageHeader } from '@/components/page-header';
import { ReportForm } from '@/components/report-form';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, addDocumentNonBlocking, useUser } from '@/firebase';
import { collection, writeBatch, doc, getDocs, query, where } from 'firebase/firestore';
import type { AnalyzeCitizenReportOutput } from '@/ai/flows/analyze-citizen-reports.flow';
import type { IncidentReport } from '@/lib/data';
import { useCallback, useState } from 'react';
import type { UserProfile } from '@/firebase/provider';

export default function NewReportPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReportSubmit = useCallback(async (
    analysisResult: AnalyzeCitizenReportOutput,
    formData: {
      reportText: string;
      location: string;
    }
  ) => {
    if (!firestore || !user || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const newReport: Omit<IncidentReport, 'id'> = {
        incidentType: analysisResult.incidentType,
        riskLevel: analysisResult.riskLevel,
        summary: analysisResult.summary,
        description: formData.reportText,
        userId: user.uid,
        location: formData.location,
        reportTime: new Date().toISOString(),
        status: 'unverified',
        confirmations: [],
        disputes: [],
      };

      const incidentReportsRef = collection(firestore, 'incidentReports');
      await addDocumentNonBlocking(incidentReportsRef, newReport);

      toast({
        title: 'Reporte Enviado',
        description: 'Gracias por tu contribución a la seguridad de la comunidad.',
      });

      // After saving, if risk is medium or high, trigger the alert logic
      if (newReport.riskLevel === 'medium' || newReport.riskLevel === 'high') {
          const securityIds: string[] = [];
          const userIds: string[] = [];
          
          const usersRef = collection(firestore, 'users');

          // 1. Get all security personnel
          const securityQuery = query(usersRef, where('role', '==', 'security'));
          const securityUsersSnapshot = await getDocs(securityQuery);
          securityUsersSnapshot.forEach(userDoc => {
              securityIds.push(userDoc.id);
          });

          // 2. Get all users subscribed to that neighborhood
          const neighborhoodQuery = query(usersRef, where('neighborhood', '==', newReport.location));
          const neighborhoodUsersSnapshot = await getDocs(neighborhoodQuery);
          neighborhoodUsersSnapshot.forEach(userDoc => {
               // Avoid double-notifying security personnel if they are also subscribed
              if ((userDoc.data() as UserProfile).role !== 'security') {
                  userIds.push(userDoc.id);
              }
          });

        const totalToNotify = userIds.length + securityIds.length;
        if (totalToNotify > 0) {
          const batch = writeBatch(firestore);
          const alertTimestamp = new Date();

          securityIds.forEach(id => {
            const notificationRef = doc(collection(firestore, `users/${id}/notifications`));
            batch.set(notificationRef, {
              message: `Alerta de ${newReport.riskLevel === 'medium' ? 'Riesgo Medio' : 'Alto Riesgo'}: ${newReport.incidentType} en ${newReport.location}.`,
              type: 'real_time_alert',
              timestamp: alertTimestamp,
              read: false,
              userId: id
            });
          });

          userIds.forEach(id => {
            const notificationRef = doc(collection(firestore, `users/${id}/notifications`));
            batch.set(notificationRef, {
              message: `Alerta en tu vecindario: Se reportó un incidente de ${newReport.riskLevel === 'medium' ? 'riesgo medio' : 'alto riesgo'} (${newReport.incidentType}).`,
              type: 'real_time_alert',
              timestamp: alertTimestamp,
              read: false,
              userId: id
            });
          });
          
          await batch.commit();

          toast({
            title: 'Alerta en Tiempo Real Enviada',
            description: `Se notificó a ${totalToNotify} usuarios.`,
          });
        }
      }

    } catch (error: any) {
       console.error("Error submitting report or sending alerts:", error);
       toast({
            variant: 'destructive',
            title: 'Error al Enviar Alertas',
            description: `El reporte se guardó, pero no se pudieron enviar las notificaciones en tiempo real.`,
        });
    } finally {
        setTimeout(() => setIsSubmitting(false), 1000);
    }
  }, [firestore, user, toast, isSubmitting]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Enviar un Nuevo Reporte"
        description="Ayude a mejorar la seguridad de la comunidad reportando incidentes de forma anónima."
      />
      <ReportForm onReportSubmit={handleReportSubmit} />
    </div>
  );
}
