'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Route } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { locations } from '@/lib/locations';

interface RoutesFormProps {
    onRouteSubmit: (start: string, end: string) => void;
}

export function RoutesForm({ onRouteSubmit }: RoutesFormProps) {
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!startLocation || !endLocation) {
        // Podrías añadir un toast aquí si quieres
        return;
    }
    setIsSubmitting(true);
    onRouteSubmit(startLocation, endLocation);
    // Simular un pequeño retraso para que el usuario vea el loader
    setTimeout(() => setIsSubmitting(false), 500);
  };
  

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Planifica Tu Viaje</CardTitle>
          <CardDescription>
            Selecciona tus puntos de inicio y fin para encontrar la ruta más
            segura.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="startLocation">Ubicación de Inicio</Label>
              <Select name="startLocation" required value={startLocation} onValueChange={setStartLocation}>
                <SelectTrigger id="startLocation">
                  <SelectValue placeholder="Selecciona una ubicación" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={`start-${location}`} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="endLocation">Ubicación Final</Label>
              <Select name="endLocation" required value={endLocation} onValueChange={setEndLocation}>
                <SelectTrigger id="endLocation">
                  <SelectValue placeholder="Selecciona una ubicación" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={`end-${location}`} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Modo de Transporte</Label>
              <RadioGroup
                name="transportMode"
                defaultValue="pedestrian"
                className="mt-2 grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="pedestrian"
                    id="pedestrian"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="pedestrian"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    Peatón
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="public_transport"
                    id="public_transport"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="public_transport"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    Transporte Público
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <Button type="submit" disabled={isSubmitting || !startLocation || !endLocation} className="w-full">
                {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Route className="mr-2 h-4 w-4" />
                )}
                Encontrar Rutas
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
