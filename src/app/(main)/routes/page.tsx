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
    if (!startLocation) {
      setStartLocation(locationName);
    } else if (!endLocation) {
      setEndLocation(locationName);
    }
    // If both are set, the next click will reset the start location
    else {
        setStartLocation(locationName);
        setEndLocation('');
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
