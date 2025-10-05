'use client';

import { PageHeader } from '@/components/page-header';
import { ReportForm } from '@/components/report-form';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, addDocumentNonBlocking, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { AnalyzeCitizenReportOutput } from '@/ai/flows/analyze-citizen-reports.flow';
import type { IncidentReport } from '@/lib/data';
import { useCallback, useState } from 'react';

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
      };

      const incidentReportsRef = collection(firestore, 'incidentReports');
      await addDocumentNonBlocking(incidentReportsRef, newReport);

      toast({
        title: 'Reporte Enviado',
        description: 'Gracias por tu contribución a la seguridad de la comunidad.',
      });
    } catch (error) {
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
