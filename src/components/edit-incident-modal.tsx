'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { type IncidentReport } from '@/lib/data';
import { locations } from '@/lib/locations';
import { Loader2 } from 'lucide-react';

const incidentSchema = z.object({
  incidentType: z.string().min(1, 'El tipo de incidente es requerido.'),
  riskLevel: z.enum(['low', 'medium', 'high']),
  location: z.string().min(1, 'La ubicación es requerida.'),
  summary: z.string().min(1, 'El resumen es requerido.'),
});

type IncidentFormData = z.infer<typeof incidentSchema>;

interface EditIncidentModalProps {
  report: IncidentReport | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditIncidentModal({
  report,
  isOpen,
  onClose,
}: EditIncidentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
  });

  useEffect(() => {
    if (report) {
      reset({
        incidentType: report.incidentType,
        riskLevel: report.riskLevel,
        location: report.location,
        summary: report.summary,
      });
    } else {
      reset({
        incidentType: '',
        riskLevel: 'low',
        location: '',
        summary: '',
      });
    }
  }, [report, reset]);

  const onSubmit = async (data: IncidentFormData) => {
    if (!report || !firestore) return;

    setIsSubmitting(true);
    try {
      const reportRef = doc(firestore, 'incidentReports', report.id);
      updateDocumentNonBlocking(reportRef, data);

      toast({
        title: 'Incidente Actualizado',
        description: 'Los cambios se han guardado correctamente.',
      });
      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al actualizar',
        description:
          'No se pudo guardar los cambios. Por favor, inténtalo de nuevo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Incidente</DialogTitle>
          <DialogDescription>
            Realiza cambios en el reporte del incidente. Haz clic en guardar
            cuando hayas terminado.
          </DialogDescription>
        </DialogHeader>
        {report && (
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="incidentType">Tipo de Incidente</Label>
              <Input
                id="incidentType"
                {...register('incidentType')}
                defaultValue={report.incidentType}
              />
              {errors.incidentType && (
                <p className="text-sm text-destructive">
                  {errors.incidentType.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="riskLevel">Nivel de Riesgo</Label>
              <Controller
                name="riskLevel"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un nivel de riesgo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Bajo</SelectItem>
                      <SelectItem value="medium">Medio</SelectItem>
                      <SelectItem value="high">Alto</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="location">Ubicación</Label>
               <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una ubicación" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.location && (
                <p className="text-sm text-destructive">
                  {errors.location.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="summary">Resumen</Label>
              <Textarea
                id="summary"
                {...register('summary')}
                defaultValue={report.summary}
                className="min-h-[100px]"
              />
              {errors.summary && (
                <p className="text-sm text-destructive">
                  {errors.summary.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
