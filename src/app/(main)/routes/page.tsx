'use client';

import { PageHeader } from '@/components/page-header';
import { RoutesForm } from '@/components/routes-form';
import { Loader } from '@/components/ui/loader';
import dynamic from 'next/dynamic';
import { useState, useCallback } from 'react';
import { cityData } from '@/lib/city-layout';
import type { LatLngTuple } from 'leaflet';
import { RouteRecommendations } from '@/components/route-recommendations';
import type { RecommendSafeRoutesOutput } from '@/ai/flows/recommend-safe-routes.flow';


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
  const [recommendations, setRecommendations] = useState<RecommendSafeRoutesOutput | null>(null);

  const handleRouteResult = useCallback((result: RecommendSafeRoutesOutput | null, start?: string, end?: string) => {
    if (result && start && end) {
      setRecommendations(result);
      const startCoords = getLocationCoordinates(start);
      const endCoords = getLocationCoordinates(end);

      if (startCoords && endCoords) {
        setRouteCoordinates({ start: startCoords, end: endCoords });
      } else {
        console.error('Could not find coordinates for one or both locations');
        setRouteCoordinates(null);
      }
    } else {
      // Clear previous results if there's an error or new search
      setRecommendations(null);
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
        <div className="flex flex-col gap-6">
            <RoutesForm onRouteResult={handleRouteResult} />
            {recommendations && <RouteRecommendations recommendations={recommendations} />}
        </div>
        <DynamicRoutesMap routeCoordinates={routeCoordinates} />
      </div>
    </div>
  );
}
