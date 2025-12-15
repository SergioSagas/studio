'use client';

import { PageHeader } from '@/components/page-header';
import { RoutesForm } from '@/components/routes-form';
import { Loader } from '@/components/ui/loader';
import dynamic from 'next/dynamic';

const DynamicRoutesMap = dynamic(() => import('@/components/routes-map'), {
  ssr: false,
  loading: () => <Loader className="h-full min-h-[400px]" />,
});

export default function SafeRoutesPage() {
  // Estado ha sido eliminado para aislar los componentes y prevenir bucles infinitos.
  // La comunicación entre el mapa y el formulario está temporalmente deshabilitada.

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Recomendaciones de Rutas Seguras"
        description="Planifica tu viaje con análisis de seguridad impulsado por IA."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* El formulario ahora es completamente independiente */}
        <RoutesForm />
        {/* El mapa ya no recibe coordenadas para la ruta */}
        <DynamicRoutesMap routeCoordinates={null} />
      </div>
    </div>
  );
}
