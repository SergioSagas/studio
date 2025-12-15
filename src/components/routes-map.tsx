'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Card, CardContent } from '@/components/ui/card';
import { cityData } from '@/lib/city-layout';

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

export default function RoutesMap() {
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
  );
}
