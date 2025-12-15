'use client';

import { useEffect, useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { planSafeRoutesAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RouteRecommendations } from '@/components/route-recommendations';
import { Loader2, Route } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { locations } from '@/lib/locations';
import { Input } from '@/components/ui/input';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Route className="mr-2 h-4 w-4" />
      )}
      Encontrar Rutas Seguras
    </Button>
  );
}

export function RoutesForm() {
  const { toast } = useToast();
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');

  const [state, formAction] = useActionState(planSafeRoutesAction, {
    status: 'idle',
  });

  useEffect(() => {
    if (state.status === 'success') {
      toast({
        title: 'Plan de Ruta Listo',
        description: state.message,
      });
    } else if (state.status === 'error') {
      toast({
        title: 'Planificación Fallida',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Planifica Tu Viaje</CardTitle>
          <CardDescription>
            Introduce tus puntos de inicio y fin para obtener recomendaciones de rutas seguras impulsadas por IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <Input type="hidden" name="startLocation" value={startLocation} />
            <Input type="hidden" name="endLocation" value={endLocation} />
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="startLocation-select">Ubicación de Inicio</Label>
              <Select onValueChange={setStartLocation} required value={startLocation}>
                <SelectTrigger id="startLocation-select">
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
              {state.errors?.startLocation && (
                <p className="text-sm text-destructive">
                  {state.errors.startLocation[0]}
                </p>
              )}
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="endLocation-select">Ubicación Final</Label>
               <Select onValueChange={setEndLocation} required value={endLocation}>
                <SelectTrigger id="endLocation-select">
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
              {state.errors?.endLocation && (
                <p className="text-sm text-destructive">
                  {state.errors.endLocation[0]}
                </p>
              )}
            </div>
            <div>
              <Label>Modo de Transporte</Label>
              <RadioGroup
                name="transportMode"
                defaultValue="pedestrian"
                className="mt-2 grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem value="pedestrian" id="pedestrian" className="peer sr-only" />
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
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
      
      {state.status === 'success' && state.data && (
          <RouteRecommendations recommendations={state.data} />
      )}
    </div>
  );
}
