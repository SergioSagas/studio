'use client';

import { useState, useEffect } from 'react';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from '@/components/ui/card';
import { cityData } from '@/lib/city-layout';
import { Loader } from '@/components/ui/loader';

// Coordenadas para centrar el mapa en Nuevo Chimbote
const defaultPosition: [number, number] = [-9.123, -78.535];

// Crear un icono personalizado para los marcadores
const customIcon = new Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});


export function RoutesMap() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Esta es la corrección clave: no intentamos renderizar el mapa hasta que
  // el componente esté montado en el cliente.
  if (!isClient) {
    return (
        <Card className="h-full min-h-[400px] lg:min-h-0 flex items-center justify-center">
            <CardContent className="flex flex-col items-center gap-2">
                <Loader />
                <p className="text-muted-foreground text-sm">Cargando mapa...</p>
            </CardContent>
        </Card>
    );
  }

  // Importamos dinámicamente los componentes de react-leaflet solo en el cliente
  const MapContainer = require('react-leaflet').MapContainer;
  const TileLayer = require('react-leaflet').TileLayer;
  const Marker = require('react-leaflet').Marker;
  const Popup = require('react-leaflet').Popup;

  const locationsWithCoords = Object.entries(cityData.Mapa_Base_Nuevo_Chimbote.ubicaciones)
    .filter(([, details]) => details.coordenadas)
    .map(([name, details]) => ({ name, ...details }));

  return (
    <Card className="h-full min-h-[400px] lg:min-h-0">
      <CardContent className="p-0 h-full rounded-lg overflow-hidden">
        <MapContainer center={defaultPosition} zoom={14} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {locationsWithCoords.map((location) => (
             location.coordenadas && (
              <Marker 
                key={location.name} 
                position={[location.coordenadas.lat, location.coordenadas.lng]}
                icon={customIcon}
              >
              <Popup>
                {location.name} <br /> <span className="text-muted-foreground text-xs">{location.tipo}</span>
              </Popup>
            </Marker>
             )
          ))}
        </MapContainer>
      </CardContent>
    </Card>
  );
}
