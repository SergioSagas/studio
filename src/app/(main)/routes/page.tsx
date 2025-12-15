'use client';
import { PageHeader } from '@/components/page-header';
import { RoutesForm } from '@/components/routes-form';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';

const RoutesMap = dynamic(
  () => import('@/components/routes-map').then((mod) => mod.RoutesMap),
  {
    loading: () => <p>Cargando mapa...</p>,
    ssr: false,
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
