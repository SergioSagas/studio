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
  const { isPending } = useActionState(analyzeReportAction, { status: 'idle' });
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
  const [state, formAction, isPending] = useActionState(analyzeReportAction, {
    status: 'idle',
  });
  const [locationValue, setLocationValue] = useState('');


  useEffect(() => {
    if (isPending) return;

    if (state.status === 'success' && state.data) {
      const formData = new FormData(formRef.current!);
      
      onReportSubmit(state.data, {
        reportText: formData.get('reportText') as string,
        location: formData.get('location') as string,
      });
      formRef.current?.reset();
      setLocationValue('');
    } else if (state.status === 'error') {
      toast({
        title: 'Error en el Análisis',
        description: state.message,
        variant: 'destructive',
      });
    }
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
        {state.status === 'success' && state.data ? (
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
