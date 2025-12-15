'use client';

import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from './ui/button';
import { Map as MapIcon, AlertTriangle } from 'lucide-react';
import { cityData } from '@/lib/city-layout';
import type L from 'leaflet';


// --- Error Boundary ---
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, { hasError: boolean }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Map component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
// --- End Error Boundary ---


// --- Map Component ---
const MapComponent = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    // Centrar en la Plaza Mayor
    const defaultPosition: L.LatLngTuple = [-9.122095, -78.531126];

    useEffect(() => {
        if (mapRef.current && !mapInstance.current) {
            // Importar Leaflet dinámicamente solo en el cliente
            import('leaflet').then(L => {
                // Corrige el problema del icono por defecto de Leaflet
                delete (L.Icon.Default.prototype as any)._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                });
                
                // Evitar reinicialización
                if (mapRef.current && !(mapRef.current as any)._leaflet_id) {
                    mapInstance.current = L.map(mapRef.current).setView(defaultPosition, 14);

                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }).addTo(mapInstance.current);

                    // Añadir marcadores desde cityData
                    Object.entries(cityData.Mapa_Base_Nuevo_Chimbote.ubicaciones).forEach(([name, details]) => {
                        if (details.coordenadas) {
                            L.marker([details.coordenadas.lat, details.coordenadas.lng])
                                .addTo(mapInstance.current!)
                                .bindPopup(`<b>${name}</b>`);
                        }
                    });
                }
            }).catch(err => {
                console.error("Failed to load Leaflet", err);
            });
        }

        // Función de limpieza para destruir el mapa
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []); 

    return (
        <Card className="h-full min-h-[400px] lg:min-h-0">
            <CardContent className="p-0 h-full rounded-lg overflow-hidden">
                <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
            </CardContent>
        </Card>
    );
};
// --- End Map Component ---


// --- Main Exported Component ---
export default function RoutesMap() {
    const [showMap, setShowMap] = useState(false);

    const errorFallback = (
        <Card className="h-full flex flex-col items-center justify-center bg-destructive/10 border-destructive">
            <CardContent className="text-center">
                <AlertTriangle className="mx-auto size-12 text-destructive" />
                <h3 className="mt-4 text-lg font-semibold text-destructive-foreground">Error al Cargar el Mapa</h3>
                <p className="mt-2 text-sm text-destructive-foreground/80">
                  Hubo un problema al inicializar el componente del mapa. Por favor, intenta recargar la página.
                </p>
            </CardContent>
        </Card>
    );

    if (!showMap) {
        return (
            <Card className="h-full flex flex-col items-center justify-center">
              <CardContent className="text-center">
                <MapIcon className="mx-auto size-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Visualiza el Mapa</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Haz clic en el botón para cargar el mapa interactivo de la ciudad.
                </p>
                <Button onClick={() => setShowMap(true)} className="mt-4">
                  Mostrar Mapa
                </Button>
              </CardContent>
            </Card>
        );
    }
    
    return (
        <ErrorBoundary fallback={errorFallback}>
            <MapComponent />
        </ErrorBoundary>
    );
}
