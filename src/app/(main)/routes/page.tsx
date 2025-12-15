'use client';
import { PageHeader } from '@/components/page-header';
import { RoutesForm } from '@/components/routes-form';
import dynamic from 'next/dynamic';
import { Loader } from '@/components/ui/loader';
import { Card, CardContent } from '@/components/ui/card';

const RoutesMap = dynamic(() => import('@/components/routes-map'), {
  ssr: false,
  loading: () => (
    <Card className="h-full min-h-[400px] lg:min-h-0 flex items-center justify-center">
      <CardContent className="flex flex-col items-center gap-2">
        <Loader />
        <p className="text-muted-foreground text-sm">Cargando mapa...</p>
      </CardContent>
    </Card>
  ),
});

export default function SafeRoutesPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Recomendaciones de Rutas Seguras"
        description="Planifica tu viaje con análisis de seguridad impulsado por IA."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <RoutesForm />
        <RoutesMap />
      </div>
    </div>
  );
}
