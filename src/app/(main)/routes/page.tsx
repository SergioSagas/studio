'use client';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { RoutesForm } from '@/components/routes-form';
import dynamic from 'next/dynamic';
import { Loader } from '@/components/ui/loader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Map } from 'lucide-react';

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
  const [showMap, setShowMap] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Recomendaciones de Rutas Seguras"
        description="Planifica tu viaje con análisis de seguridad impulsado por IA."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <RoutesForm />
        <div className="h-full min-h-[400px] lg:min-h-0">
          {showMap ? (
            <RoutesMap />
          ) : (
            <Card className="h-full flex flex-col items-center justify-center">
              <CardContent className="text-center">
                <Map className="mx-auto size-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Visualiza el Mapa</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Haz clic en el botón para cargar el mapa interactivo de la ciudad.
                </p>
                <Button onClick={() => setShowMap(true)} className="mt-4">
                  Mostrar Mapa
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
