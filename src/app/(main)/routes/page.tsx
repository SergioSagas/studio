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
    // Si el inicio está vacío, o si ambas ubicaciones ya están seleccionadas,
    // el próximo clic debe establecer una nueva ubicación de inicio.
    if (!startLocation || (startLocation && endLocation)) {
      setStartLocation(locationName);
      setEndLocation(''); // Limpia la ubicación final para empezar una nueva ruta
      setRouteResult(null); // Limpia los resultados anteriores
      setRouteCoordinates(null); // Limpia las coordenadas de la ruta anterior
    } 
    // Si el inicio ya está establecido pero el final no, establece la ubicación final.
    else if (startLocation && !endLocation) {
      // Evita seleccionar el mismo punto dos veces
      if (locationName !== startLocation) {
        setEndLocation(locationName);
      }
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
