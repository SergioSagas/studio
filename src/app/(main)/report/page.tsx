import { PageHeader } from '@/components/page-header';
import { ReportForm } from '@/components/report-form';

export default function NewReportPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Enviar un Nuevo Reporte"
        description="Ayude a mejorar la seguridad de la comunidad reportando incidentes de forma anónima."
      />
      <ReportForm />
    </div>
  );
}
