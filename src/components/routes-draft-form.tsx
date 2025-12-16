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
import { useToast } from '@/hooks/use-toast';

interface RoutesFormProps {
  onRouteResult: (
    result: RecommendSafeRoutesOutput | null,
    start?: string,
    end?: string
  ) => void;
}

function SubmitButton({ onClick, isPending }: { onClick: () => void, isPending: boolean}) {
  return (
    <Button type="submit" disabled={isPending} className="w-full" onClick={onClick}>
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Route className="mr-2 h-4 w-4" />
      )}
      Encontrar Rutas Seguras
    </Button>
  );
}

export function RoutesDraftForm({ onRouteResult }: RoutesFormProps) {
  const { toast } = useToast();
  const [state, formAction, isPending] = useActionState(planSafeRoutesAction, {
    status: 'idle',
  });
  const formRef = useRef<HTMLFormElement>(null);
  
  // Track if the current successful submission has been handled
  const submissionId = state.status === 'success' ? `${state.startLocation}-${state.endLocation}-${state.data?.overallRecommendation}` : null;
  const handledSubmissionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (state.status === 'success' && state.data && submissionId !== handledSubmissionIdRef.current) {
      onRouteResult(state.data, state.startLocation, state.endLocation);
      handledSubmissionIdRef.current = submissionId; // Mark as handled
    } else if (state.status === 'error') {
      onRouteResult(null); // Clear previous results on error
      toast({
        variant: 'destructive',
        title: 'Error en la Planificación',
        description: state.message || 'No se pudieron generar las rutas. Por favor, inténtelo más tarde.',
      });
    }
  }, [state, onRouteResult, toast, submissionId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Planifica Tu Viaje (Borrador)</CardTitle>
        <CardDescription>
          Selecciona tus puntos de inicio y fin para encontrar la ruta más
          segura.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          ref={formRef}
          action={formAction}
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
            {state?.errors?.endLocation && (
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
                  id="pedestrian-draft"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="pedestrian-draft"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  Peatón
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="public_transport"
                  id="public_transport-draft"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="public_transport-draft"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  Transporte Público
                </Label>
              </div>
            </RadioGroup>
          </div>
          <SubmitButton 
             isPending={isPending}
             onClick={() => {
                // Clear previous results when a new search is initiated
                onRouteResult(null);
                handledSubmissionIdRef.current = null;
             }}
          />
        </form>
      </CardContent>
    </Card>
  );
}
