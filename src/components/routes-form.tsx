'use client';

import { useEffect, useActionState } from 'react';
import { planSafeRoutesAction, type RouteState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
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
import { RouteRecommendations } from '@/components/route-recommendations';
import { Loader2, Route } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { locations } from '@/lib/locations';
import type { RecommendSafeRoutesOutput } from '@/ai/flows/recommend-safe-routes.flow';

function SubmitButton() {
  const [, , isPending] = useActionState<RouteState, FormData>(
    planSafeRoutesAction,
    { status: 'idle' }
  );
  return (
    <Button type="submit" disabled={isPending} className="w-full">
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Route className="mr-2 h-4 w-4" />
      )}
      Encontrar Rutas Seguras
    </Button>
  );
}

interface RoutesFormProps {
    onRouteResult: (result: RecommendSafeRoutesOutput | null, start?: string, end?: string) => void;
}

export function RoutesForm({ onRouteResult }: RoutesFormProps) {
  const { toast } = useToast();

  const [state, formAction, isPending] = useActionState<RouteState, FormData>(
    planSafeRoutesAction,
    {
      status: 'idle',
    }
  );

  useEffect(() => {
    if (isPending) {
        onRouteResult(null);
        return;
    }

    if (state.status === 'success' && state.data) {
      onRouteResult(state.data, state.startLocation, state.endLocation);
    } else if (state.status === 'error') {
      toast({
        title: 'Planificación Fallida',
        description: state.message,
        variant: 'destructive',
      });
      onRouteResult(null); // Clear previous results on error
    }
  }, [state, isPending, toast, onRouteResult]);

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
          <form action={formAction} className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="startLocation">Ubicación de Inicio</Label>
              <Select name="startLocation" required>
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
              {state.errors?.startLocation && (
                <p className="text-sm text-destructive">
                  {state.errors.startLocation[0]}
                </p>
              )}
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="endLocation">Ubicación Final</Label>
              <Select name="endLocation" required>
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
