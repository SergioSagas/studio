'use client';

import { PageHeader } from '@/components/page-header';
import { ReportForm } from '@/components/report-form';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, addDocumentNonBlocking, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { AnalyzeCitizenReportOutput } from '@/ai/flows/analyze-citizen-reports.flow';
import type { IncidentReport } from '@/lib/data';

export default function NewReportPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const handleReportSubmit = async (
    analysisResult: AnalyzeCitizenReportOutput,
    formData: {
      reportText: string;
      location: string;
    }
  ) => {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Error de base de datos',
        description: 'No se pudo conectar a la base de datos.',
      });
      return;
    }

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error de autenticación',
        description: 'No se pudo obtener la identificación del usuario. Intente recargar la página.',
      });
      return;
    }

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
    addDocumentNonBlocking(incidentReportsRef, newReport);

    toast({
      title: 'Reporte Enviado',
      description: 'Gracias por tu contribución a la seguridad de la comunidad.',
    });
  };

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
