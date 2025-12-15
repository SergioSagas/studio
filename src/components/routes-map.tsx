'use client';

import 'leaflet/dist/leaflet.css';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cityData } from '@/lib/city-layout';
import { AlertTriangle } from 'lucide-react';


// Crear un icono personalizado para los marcadores para evitar problemas con el empaquetado de Next.js
const customIcon = new Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});


// ---- Error Boundary Component ----
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class MapErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Actualiza el estado para que el siguiente renderizado muestre la interfaz de repuesto.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // También puedes registrar el error en un servicio de reporte de errores
    console.error("Error al renderizar el mapa:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Puedes renderizar cualquier interfaz de repuesto
      return (
         <Card className="h-full flex flex-col items-center justify-center bg-destructive/10 border-destructive/50">
            <CardHeader className="text-center">
                <div className="mx-auto rounded-full bg-destructive/20 p-3">
                    <AlertTriangle className="size-8 text-destructive" />
                </div>
                <CardTitle className="text-destructive pt-2">Error al Cargar el Mapa</CardTitle>
                <CardDescription className="text-destructive/80">
                    No se pudo inicializar el componente del mapa.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground">
                    Detalle: {this.state.error?.message || 'Error desconocido.'}
                </p>
            </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
// ---------------------------------


function MapComponent() {
    const defaultPosition: [number, number] = [-9.123, -78.535];
    const locationsWithCoords = Object.entries(cityData.Mapa_Base_Nuevo_Chimbote.ubicaciones)
        .filter(([, details]) => details.coordenadas)
        .map(([name, details]) => ({ name, ...details }));
        
    return (
        <Card className="h-full min-h-[400px] lg:min-h-0">
          <CardContent className="p-0 h-full rounded-lg overflow-hidden">
            <MapContainer
              center={defaultPosition}
              zoom={14}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {locationsWithCoords.map((location) =>
                location.coordenadas ? (
                  <Marker
                    key={location.name}
                    position={[location.coordenadas.lat, location.coordenadas.lng]}
                    icon={customIcon}
                  >
                    <Popup>
                      {location.name} <br />{' '}
                      <span className="text-muted-foreground text-xs">{location.tipo}</span>
                    </Popup>
                  </Marker>
                ) : null
              )}
            </MapContainer>
          </CardContent>
        </Card>
    )
}


// Componente principal que envuelve el mapa con el Error Boundary
export default function RoutesMap() {
    return (
        <MapErrorBoundary>
            <MapComponent />
        </MapErrorBoundary>
    )
}
