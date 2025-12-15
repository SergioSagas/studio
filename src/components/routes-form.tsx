'use client';

import { useEffect, useActionState, useRef } from 'react';
import { planSafeRoutesAction, type RouteState } from '@/app/actions';
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
import type { RecommendSafeRoutesOutput } from '@/ai/flows/recommend-safe-routes.flow';

interface RoutesFormProps {
    onRouteResult: (result: RecommendSafeRoutesOutput | null, start?: string, end?: string) => void;
}

function SubmitButton() {
  const [,, isPending] = useActionState(planSafeRoutesAction, { status: 'idle' });
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

export function RoutesForm({ onRouteResult }: RoutesFormProps) {
  const [state, formAction] = useActionState(planSafeRoutesAction, { status: 'idle' });
  const formRef = useRef<HTMLFormElement>(null);
  const initialStateRef = useRef<RouteState>({ status: 'idle' });

  useEffect(() => {
    // Notify parent only when a successful result is received from the action
    if (state.status === 'success' && state.data) {
      onRouteResult(state.data, state.startLocation, state.endLocation);
    } else if (state.status === 'error') {
      // Clear results on error
      onRouteResult(null);
    }
  }, [state, onRouteResult]);

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    // Clear previous results when starting a new search
    onRouteResult(null); 
    
    formAction(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Planifica Tu Viaje</CardTitle>
        <CardDescription>
          Selecciona tus puntos de inicio y fin para encontrar la ruta más
          segura.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          ref={formRef}
          onSubmit={handleFormSubmit}
          className="space-y-4"
        >
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
            {state?.errors?.startLocation && (
                <p className="text-sm text-destructive">{state.errors.startLocation[0]}</p>
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
             {state?.errors?.endLocation && (
                <p className="text-sm text-destructive">{state.errors.endLocation[0]}</p>
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
  );
}
