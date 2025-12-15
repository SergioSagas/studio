'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cityData } from '@/lib/city-layout';
import { Map, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

// Corrige el problema del icono por defecto de Leaflet con Webpack/Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});


const MapComponent = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const defaultPosition: L.LatLngTuple = [-9.123, -78.535];

    useEffect(() => {
        // Solo inicializar si el div del mapa existe y no hay una instancia del mapa ya creada
        if (mapRef.current && !mapInstance.current) {
            mapInstance.current = L.map(mapRef.current).setView(defaultPosition, 14);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstance.current);

            // Añadir marcadores
            Object.entries(cityData.Mapa_Base_Nuevo_Chimbote.ubicaciones).forEach(([name, details]) => {
                if (details.coordenadas) {
                    L.marker([details.coordenadas.lat, details.coordenadas.lng])
                        .addTo(mapInstance.current!)
                        .bindPopup(`<b>${name}</b><br>${details.tipo}`);
                }
            });
        }

        // Función de limpieza para destruir el mapa cuando el componente se desmonte
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []); // El array de dependencias vacío asegura que esto se ejecute solo una vez

    return (
        <Card className="h-full min-h-[400px] lg:min-h-0">
            <CardContent className="p-0 h-full rounded-lg overflow-hidden">
                <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
            </CardContent>
        </Card>
    );
}

// Componente principal que envuelve el mapa y gestiona la carga bajo demanda
export default function RoutesMap() {
    const [showMap, setShowMap] = useState(false);

    if (!showMap) {
        return (
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
        );
    }
    
    return <MapComponent />;
}
