'use client';

import { useState, useCallback } from 'react';
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
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [routeResult, setRouteResult] = useState<RecommendSafeRoutesOutput | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<{ start: LatLngTuple, end: LatLngTuple } | null>(null);

  const handleLocationSelect = useCallback((locationName: string) => {
    // Si ambas ubicaciones están seleccionadas, el próximo clic reinicia la ruta.
    if (startLocation && endLocation) {
      setStartLocation(locationName);
      setEndLocation('');
      setRouteResult(null);
      setRouteCoordinates(null);
    } 
    // Si no hay punto de inicio, establece el punto de inicio.
    else if (!startLocation) {
      setStartLocation(locationName);
    } 
    // Si hay un inicio pero no un final, y no es el mismo punto, establece el final.
    else if (locationName !== startLocation) {
      setEndLocation(locationName);
    }
  }, [startLocation, endLocation]);


  const handleFormSubmit = (result: RecommendSafeRoutesOutput, startCoords: LatLngTuple, endCoords: LatLngTuple) => {
      setRouteResult(result);
      setRouteCoordinates({ start: startCoords, end: endCoords });
  }
  
  // Usar useCallback para estabilizar las funciones y evitar bucles de renderizado.
  const handleStartLocationChange = useCallback((loc: string) => {
    setStartLocation(loc);
  }, []);

  const handleEndLocationChange = useCallback((loc: string) => {
    setEndLocation(loc);
  }, []);


  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Recomendaciones de Rutas Seguras"
        description="Planifica tu viaje con análisis de seguridad impulsado por IA."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <RoutesForm
          startLocation={startLocation}
          endLocation={endLocation}
          routeResult={routeResult}
          onFormSubmit={handleFormSubmit}
          onStartLocationChange={handleStartLocationChange}
          onEndLocationChange={handleEndLocationChange}
        />
        <DynamicRoutesMap 
          onLocationSelect={handleLocationSelect}
          startLocationName={startLocation}
          endLocationName={endLocation}
          routeCoordinates={routeCoordinates}
        />
      </div>
    </div>
  );
}
