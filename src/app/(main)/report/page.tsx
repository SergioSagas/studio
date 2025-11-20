'use client';

import { PageHeader } from '@/components/page-header';
import { ReportForm } from '@/components/report-form';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, addDocumentNonBlocking, useUser } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import type { AnalyzeCitizenReportOutput } from '@/ai/flows/analyze-citizen-reports.flow';
import type { IncidentReport } from '@/lib/data';
import { useCallback, useState } from 'react';
import { sendRealTimeAlertsAction } from '@/app/actions';

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
        const result = await sendRealTimeAlertsAction({
          reportId: docRef.id,
          location: newReport.location,
          riskLevel: newReport.riskLevel,
          incidentType: newReport.incidentType,
        });

        if (result.status === 'success' && result.notifiedCount > 0) {
          toast({
            title: 'Alerta en Tiempo Real Enviada',
            description: `Se notificó a ${result.notifiedCount} usuarios.`,
          });
        } else if (result.status === 'error') {
            toast({
                variant: 'destructive',
                title: 'Error al Enviar Alertas',
                description: 'El reporte se guardó, pero no se pudieron enviar las notificaciones en tiempo real.',
            });
        }
      }

    } catch (error) {
       console.error("Error submitting report:", error);
       toast({
            variant: 'destructive',
            title: 'Error al guardar',
            description: 'No se pudo guardar el reporte en la base de datos.',
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
