import { PageHeader } from '@/components/page-header';
import { RoutesForm } from '@/components/routes-form';

export default function SafeRoutesPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Recomendaciones de Rutas Seguras"
        description="Planifica tu viaje con análisis de seguridad impulsado por IA."
      />
      <RoutesForm />
    </div>
  );
}
