'use client';

import { PageHeader } from '@/components/page-header';
import { RoutesForm } from '@/components/routes-form';
import { Loader } from '@/components/ui/loader';
import dynamic from 'next/dynamic';
import { useState, useCallback } from 'react';
import { cityData } from '@/lib/city-layout';
import type { LatLngTuple } from 'leaflet';

const DynamicRoutesMap = dynamic(() => import('@/components/routes-map'), {
  ssr: false,
  loading: () => <Loader className="h-full min-h-[400px]" />,
});

// Función para obtener coordenadas por nombre de ubicación
const getLocationCoordinates = (name: string): LatLngTuple | null => {
  const location = cityData.Mapa_Base_Nuevo_Chimbote.ubicaciones[name];
  if (location && location.coordenadas) {
    return [location.coordenadas.lat, location.coordenadas.lng];
  }
  return null;
};

export default function SafeRoutesPage() {
  const [routeCoordinates, setRouteCoordinates] = useState<{ start: LatLngTuple; end: LatLngTuple } | null>(null);

  const handleRouteSubmit = useCallback((startLocation: string, endLocation: string) => {
    const startCoords = getLocationCoordinates(startLocation);
    const endCoords = getLocationCoordinates(endLocation);

    if (startCoords && endCoords) {
      setRouteCoordinates({ start: startCoords, end: endCoords });
    } else {
      console.error('Could not find coordinates for one or both locations');
      setRouteCoordinates(null);
    }
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Recomendaciones de Rutas Seguras"
        description="Planifica tu viaje con análisis de seguridad impulsado por IA."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <RoutesForm onRouteSubmit={handleRouteSubmit} />
        <DynamicRoutesMap routeCoordinates={routeCoordinates} />
      </div>
    </div>
  );
}
