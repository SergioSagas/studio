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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { locations } from '@/lib/locations';
import { Loader2 } from 'lucide-react';
import type { UserProfile } from '@/firebase/provider';

const profileSchema = z.object({
  neighborhood: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  userId: string;
}

export function ProfileSettingsModal({
  isOpen,
  onClose,
  userProfile,
  userId,
}: ProfileSettingsModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (userProfile) {
      reset({
        neighborhood: userProfile.neighborhood || '',
      });
    }
  }, [userProfile, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!userId || !firestore) return;

    setIsSubmitting(true);
    try {
      const userRef = doc(firestore, 'users', userId);
      updateDocumentNonBlocking(userRef, { neighborhood: data.neighborhood });

      toast({
        title: 'Perfil Actualizado',
        description: 'Tus ajustes se han guardado.',
      });
      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al actualizar',
        description: 'No se pudo guardar los cambios. Por favor, inténtalo de nuevo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajustes de Perfil</DialogTitle>
          <DialogDescription>
            Personaliza tus notificaciones seleccionando tu vecindario.
          </DialogDescription>
        </DialogHeader>
        {userProfile && (
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="neighborhood">Mi Vecindario</Label>
              <Controller
                name="neighborhood"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu vecindario para recibir alertas locales" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Ninguno (No recibir alertas)</SelectItem>
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-xs text-muted-foreground pt-1">
                Recibirás alertas de incidentes de riesgo medio y alto que ocurran en esta zona.
              </p>
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
