'use client';
import { PageHeader } from '@/components/page-header';
import { RoutesForm } from '@/components/routes-form';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { Loader } from '@/components/ui/loader';
import { Card, CardContent } from '@/components/ui/card';

// La importación dinámica se define a nivel de módulo, fuera del componente.
// Se usa useMemo solo para el componente de carga para evitar que se renderice innecesariamente.
const RoutesMap = dynamic(
  () => import('@/components/routes-map').then((mod) => mod.RoutesMap),
  {
    loading: () => (
        <Card className="h-full min-h-[400px] lg:min-h-0 flex items-center justify-center">
            <CardContent className="flex flex-col items-center gap-2">
                <Loader />
                <p className="text-muted-foreground text-sm">Cargando mapa...</p>
            </CardContent>
        </Card>
    ),
    ssr: false, // Es crucial desactivar el renderizado en servidor para Leaflet.
  }
);

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
