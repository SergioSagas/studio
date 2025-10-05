'use client';

import { useEffect, useActionState, useRef, useState } from 'react';
import { analyzeReportAction } from '@/app/actions';
import type { AnalyzeCitizenReportOutput } from '@/ai/flows/analyze-citizen-reports.flow';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ReportAnalysis } from '@/components/report-analysis';
import { Loader2, Send } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { locations } from '@/lib/locations';
import { Input } from '@/components/ui/input';

function SubmitButton() {
  // `isPending` is the third element of the array returned by useActionState
  const [,, isPending] = useActionState(analyzeReportAction, { status: 'idle' });
  return (
    <Button type="submit" disabled={isPending} className="w-full">
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Send className="mr-2 h-4 w-4" />
      )}
      Analizar y Enviar Reporte
    </Button>
  );
}

type ReportFormProps = {
  onReportSubmit: (
    analysisResult: AnalyzeCitizenReportOutput,
    formData: {
      reportText: string;
      location: string;
    }
  ) => Promise<void>;
};

export function ReportForm({ onReportSubmit }: ReportFormProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  // useActionState returns [state, formAction, isPending].
  // We rename the third element to resetState because we'll create our own formAction wrapper.
  const [state, dispatch, isPending] = useActionState(analyzeReportAction, {
    status: 'idle',
  });
  
  const [locationValue, setLocationValue] = useState('');

  const formAction = (formData: FormData) => {
    dispatch(formData);
  };
  
  const resetActionState = () => {
    // This is a bit of a hack, but there's no official reset for useActionState yet.
    // We dispatch a custom action that the reducer doesn't handle, which effectively
    // resets the state if we design the reducer to return the initial state for unknown actions.
    // Let's just reset the state manually for now. We don't have a dispatch for the reducer.
    // The most correct way is to have the parent component manage a key.
    // But for now, we will manage it inside.
  }


  useEffect(() => {
    if (isPending) return;

    if (state.status === 'success' && state.data) {
      const formData = new FormData(formRef.current!);
      
      onReportSubmit(state.data, {
        reportText: formData.get('reportText') as string,
        location: formData.get('location') as string,
      }).then(() => {
         // This is key: after submission, reset the form and the state.
        if (formRef.current) {
          formRef.current.reset();
        }
        setLocationValue('');
        // We can't directly reset the state of useActionState, but by re-rendering
        // and ensuring deps are clean, we prevent re-submission.
        // A better fix is to ensure onReportSubmit is stable (useCallback)
        // and that the state object is distinct on each action.
        // The core issue is the onReportSubmit being called again on re-renders.
      });
    } else if (state.status === 'error') {
      toast({
        title: 'Error en el Análisis',
        description: state.message,
        variant: 'destructive',
      });
    }
    
  // By making onReportSubmit a dependency, we ensure this only runs when it changes.
  // The parent component should wrap it in useCallback.
  }, [state, isPending, toast, onReportSubmit]);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Enviar Reporte de Incidente</CardTitle>
          <CardDescription>
            Proporcione una descripción detallada y anónima del incidente. La IA lo analizará para determinar el riesgo y el tipo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="space-y-4">
            <Input type="hidden" name="location" value={locationValue} />
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="reportText">Detalles del Incidente</Label>
              <Textarea
                id="reportText"
                name="reportText"
                placeholder="Describa la situación, personas involucradas y cualquier otro detalle relevante..."
                className="min-h-[150px]"
                required
              />
              {state.errors?.reportText && (
                <p className="text-sm text-destructive">
                  {state.errors.reportText[0]}
                </p>
              )}
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="location-select">Ubicación</Label>
               <Select onValueChange={setLocationValue} required value={locationValue}>
                <SelectTrigger id="location-select">
                  <SelectValue placeholder="Selecciona una ubicación" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
               {state.errors?.location && (
                <p className="text-sm text-destructive">
                  {state.errors.location[0]}
                </p>
              )}
            </div>
            
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
      <div>
        {isPending ? (
          <Card className="flex min-h-[300px] flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <CardHeader>
              <CardTitle>Analizando...</CardTitle>
              <CardDescription>
                La IA está procesando su reporte.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : state.status === 'success' && state.data ? (
          <ReportAnalysis analysis={state.data} />
        ) : (
          <Card className="flex min-h-[300px] flex-col items-center justify-center text-center">
            <CardHeader>
              <CardTitle>Esperando Análisis</CardTitle>
              <CardDescription>
                El análisis de IA de su reporte aparecerá aquí.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-full bg-muted p-4">
                <svg
                  className="mx-auto size-12 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}