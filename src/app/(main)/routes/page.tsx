'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { RoutesForm } from '@/components/routes-form';
import type { RecommendSafeRoutesOutput } from '@/ai/flows/recommend-safe-routes.flow';
import type { LatLngTuple } from 'leaflet';
import { Loader } from '@/components/ui/loader';
import dynamic from 'next/dynamic';


const DynamicRoutesMap = dynamic(() => import('@/components/routes-map'), {
  ssr: false,
  loading: () => <Loader className="h-full min-h-[400px]" />,
});


export default function SafeRoutesPage() {
  const [routeResult, setRouteResult] = useState<RecommendSafeRoutesOutput | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<{ start: LatLngTuple, end: LatLngTuple } | null>(null);

  // This function is now only called by the form submission action
  const handleFormSubmit = (result: RecommendSafeRoutesOutput, startCoords: LatLngTuple, endCoords: LatLngTuple) => {
      setRouteResult(result);
      setRouteCoordinates({ start: startCoords, end: endCoords });
  }
  
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Recomendaciones de Rutas Seguras"
        description="Planifica tu viaje con análisis de seguridad impulsado por IA."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <RoutesForm
          routeResult={routeResult}
          onFormSubmit={handleFormSubmit}
        />
        <DynamicRoutesMap 
          routeCoordinates={routeCoordinates}
        />
      </div>
    </div>
  );
}
