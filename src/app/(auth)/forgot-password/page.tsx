'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { useFirebaseApp } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/icons';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Por favor ingresa un email válido.' }),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const app = useFirebaseApp();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);
    const auth = getAuth(app);
    try {
      await sendPasswordResetEmail(auth, data.email);
      setEmailSent(true);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      let description = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
      if (error.code === 'auth/user-not-found') {
        description = 'No se encontró ningún usuario con ese correo electrónico.';
      }
      toast({
        variant: 'destructive',
        title: 'Error al enviar correo',
        description,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center gap-2">
            <Logo className="size-8 text-primary" />
            <span className="font-headline text-2xl font-semibold">
              CiudadSegura
            </span>
          </div>
          <CardTitle>Restablecer Contraseña</CardTitle>
          <CardDescription>
            {emailSent
              ? 'Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.'
              : 'Ingresa tu correo para recibir un enlace de restablecimiento.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailSent ? (
            <div className="text-center">
              <p className="mb-4 text-sm text-muted-foreground">
                Revisa tu bandeja de entrada (y la carpeta de spam).
              </p>
              <Button asChild className="w-full">
                <Link href="/login">Volver a Iniciar Sesión</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Enlace
              </Button>
            </form>
          )}
          {!emailSent && (
             <div className="mt-4 text-center text-sm">
                <Link href="/login" className="underline">
                    Volver a Iniciar Sesión
                </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
