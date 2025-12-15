'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { RoutesForm } from '@/components/routes-form';
import RoutesMap from '@/components/routes-map';
import type { RecommendSafeRoutesOutput } from '@/ai/flows/recommend-safe-routes.flow';
import type { LatLngTuple } from 'leaflet';

export default function SafeRoutesPage() {
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [routeResult, setRouteResult] = useState<RecommendSafeRoutesOutput | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<{ start: LatLngTuple, end: LatLngTuple } | null>(null);

  const handleLocationSelect = (locationName: string) => {
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
      setEndLocation(''); // Asegurarse de que el final esté limpio
      setRouteResult(null);
      setRouteCoordinates(null);
    } 
    // Si hay un inicio pero no un final, y no es el mismo punto, establece el final.
    else if (locationName !== startLocation) {
      setEndLocation(locationName);
    }
  };


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
          startLocation={startLocation}
          setStartLocation={setStartLocation}
          endLocation={endLocation}
          setEndLocation={setEndLocation}
          routeResult={routeResult}
          onFormSubmit={handleFormSubmit}
        />
        <RoutesMap 
          onLocationSelect={handleLocationSelect}
          startLocationName={startLocation}
          endLocationName={endLocation}
          routeCoordinates={routeCoordinates}
        />
      </div>
    </div>
  );
}
