'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from './ui/button';
import { Map as MapIcon, AlertTriangle } from 'lucide-react';
import { cityData } from '@/lib/city-layout';
import type L from 'leaflet';

// --- Types ---
type RoutesMapProps = {
  onLocationSelect: (locationName: string) => void;
  startLocationName?: string;
  endLocationName?: string;
  routeCoordinates: { start: L.LatLngTuple, end: L.LatLngTuple } | null;
};

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

// --- Map Component ---
const MapComponent = ({ onLocationSelect, startLocationName, endLocationName, routeCoordinates }: RoutesMapProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const routingControlRef = useRef<L.Routing.Control | null>(null);

    const defaultPosition: L.LatLngTuple = [-9.122095, -78.531126];

    useEffect(() => {
        let isMounted = true;
        if (mapRef.current && !mapInstance.current) {
            import('leaflet').then(L => {
                if (!isMounted) return;

                import('leaflet-routing-machine');

                delete (L.Icon.Default.prototype as any)._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                });
                
                if (mapRef.current && !(mapRef.current as any)._leaflet_id) {
                    mapInstance.current = L.map(mapRef.current).setView(defaultPosition, 14);

                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }).addTo(mapInstance.current);

                    Object.entries(cityData.Mapa_Base_Nuevo_Chimbote.ubicaciones).forEach(([name, details]) => {
                        if (details.coordenadas) {
                            const marker = L.marker([details.coordenadas.lat, details.coordenadas.lng]).addTo(mapInstance.current!);
                            
                            const popupContent = document.createElement('div');
                            popupContent.innerHTML = `<b>${name}</b><br/><button class="map-popup-button mt-2 p-2 bg-primary text-primary-foreground rounded text-xs"></button>`;
                            const button = popupContent.querySelector('.map-popup-button') as HTMLButtonElement;
                            button.onclick = () => onLocationSelect(name);

                            marker.bindPopup(popupContent);
                            marker.on('popupopen', () => {
                                let buttonText = 'Elegir ubicación de inicio';
                                if (startLocationName && !endLocationName && startLocationName !== name) {
                                    buttonText = 'Elegir ubicación final';
                                } else if (startLocationName && endLocationName) {
                                    buttonText = 'Reiniciar (elegir inicio)';
                                }
                                button.innerText = buttonText;
                            });
                        }
                    });
                }
            }).catch(err => {
                console.error("Failed to load Leaflet", err);
                throw new Error("Failed to load Leaflet. See console for details.");
            });
        }
        
        return () => {
            isMounted = false;
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []); 


    // Effect to draw the route
    useEffect(() => {
        if (mapInstance.current && routeCoordinates) {
             import('leaflet').then(L => {
                // This ensures leaflet-routing-machine is loaded
                 import('leaflet-routing-machine').then(() => {
                    if ((L as any).Routing) {
                        if (routingControlRef.current) {
                            mapInstance.current?.removeControl(routingControlRef.current);
                        }

                        routingControlRef.current = (L as any).Routing.control({
                            waypoints: [
                                L.latLng(routeCoordinates.start[0], routeCoordinates.start[1]),
                                L.latLng(routeCoordinates.end[0], routeCoordinates.end[1])
                            ],
                            routeWhileDragging: false,
                            show: false, // Oculta el panel de instrucciones de ruta
                            addWaypoints: false,
                            draggableWaypoints: false,
                            lineOptions: {
                                styles: [{ color: 'hsl(var(--primary))', opacity: 0.8, weight: 6 }]
                            }
                        }).addTo(mapInstance.current);
                    }
                 });
             });
        } else if (mapInstance.current && routingControlRef.current) {
            // If no route coordinates, remove the old route
            mapInstance.current.removeControl(routingControlRef.current);
            routingControlRef.current = null;
        }
    }, [routeCoordinates]);

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
export default function RoutesMap(props: RoutesMapProps) {
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
            <MapComponent {...props} />
        </ErrorBoundary>
    );
}
