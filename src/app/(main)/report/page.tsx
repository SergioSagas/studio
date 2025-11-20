'use client';

import { PageHeader } from '@/components/page-header';
import { ReportForm } from '@/components/report-form';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, addDocumentNonBlocking, useUser } from '@/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import type { AnalyzeCitizenReportOutput } from '@/ai/flows/analyze-citizen-reports.flow';
import type { IncidentReport } from '@/lib/data';
import { useCallback, useState } from 'react';
import { getUsersForAlertsAction } from '@/app/actions';

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
      const docRef = await addDocumentNonBlocking(incidentReportsRef, newReport);

      toast({
        title: 'Reporte Enviado',
        description: 'Gracias por tu contribución a la seguridad de la comunidad.',
      });

      // After saving, if risk is medium or high, trigger the alert action
      if (newReport.riskLevel === 'medium' || newReport.riskLevel === 'high') {
        // 1. Fetch user lists from the server action
        const usersResult = await getUsersForAlertsAction({ location: newReport.location });

        if (usersResult.status === 'success') {
          const { userIds, securityIds } = usersResult;
          const totalToNotify = userIds.length + securityIds.length;

          if (totalToNotify > 0) {
            // 2. Create notifications on the client using a batch write
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
        } else {
          // The server action to get users failed
          throw new Error(usersResult.message || 'No se pudieron obtener los destinatarios de la alerta.');
        }
      }

    } catch (error: any) {
       console.error("Error submitting report or sending alerts:", error);
       toast({
            variant: 'destructive',
            title: 'Error al Enviar Alertas',
            description: `El reporte se guardó, pero no se pudieron enviar las notificaciones en tiempo real: ${error.message}`,
        });
    } finally {
        // Reset submission state after a short delay to prevent rapid re-submissions
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
