'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirebaseApp, useFirestore } from '@/firebase';
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


const signupSchema = z.object({
  firstName: z.string().min(2, { message: 'El nombre es requerido.' }),
  lastName: z.string().min(2, { message: 'El apellido es requerido.' }),
  email: z.string().email({ message: 'Por favor ingresa un email válido.' }),
  password: z
    .string()
    .min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
});

type SignupInput = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const app = useFirebaseApp();
  const firestore = useFirestore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    setLoading(true);
    const auth = getAuth(app);
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Error de configuración',
        description: 'El servicio de base de datos no está disponible.',
      });
      setLoading(false);
      return;
    }
    try {
      // 1. Intenta crear el usuario
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      // 2. Si tiene éxito, crea el documento de perfil en Firestore
      const userRef = doc(firestore, 'users', user.uid);
      await setDoc(userRef, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: 'user',
        reputation: 10,
      });
      
      toast({
        title: 'Cuenta creada exitosamente',
        description: 'Ahora puedes iniciar sesión.',
      });
      router.push('/login');

    } catch (error: any) {
      // 3. Si el error es que el email ya existe...
      if (error.code === 'auth/email-already-in-use') {
        toast({
            variant: 'destructive',
            title: 'Correo ya registrado',
            description: 'Este correo ya está en uso. Intentando reparar perfil...',
        });
        
        try {
            // 4. Intenta iniciar sesión para obtener el UID del usuario existente
            const credential = await signInWithEmailAndPassword(auth, data.email, data.password);
            const user = credential.user;
            const userRef = doc(firestore, 'users', user.uid);
            const userDoc = await getDoc(userRef);

            // 5. Si el perfil NO existe en Firestore, créalo.
            if (!userDoc.exists()) {
                await setDoc(userRef, {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    role: 'user',
                    reputation: 10,
                });
                toast({
                    title: 'Perfil de usuario restaurado',
                    description: 'Hemos completado tu perfil. Ahora puedes iniciar sesión.'
                });
                router.push('/login');
            } else {
                 toast({
                    title: 'Perfil ya existente',
                    description: 'Tu cuenta ya estaba configurada. Puedes iniciar sesión.'
                });
                router.push('/login');
            }
        } catch (repairError: any) {
             let description = 'No pudimos reparar tu perfil. La contraseña puede ser incorrecta o hubo otro error.';
             if (repairError.code === 'auth/invalid-credential' || repairError.code === 'auth/wrong-password') {
                description = 'No se pudo reparar el perfil porque la contraseña que ingresaste es incorrecta. Inténtalo de nuevo con la contraseña original.';
             }
             toast({
                variant: 'destructive',
                title: 'Error al reparar',
                description: description,
             });
        }

      } else {
        // Otros errores de registro
        // El error de permisos será capturado por el listener global
        if(error.name !== 'FirebaseError') {
             toast({
              variant: 'destructive',
              title: 'Error al registrarse',
              description: 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.',
            });
        }
      }
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
          <CardTitle>Crear una Cuenta</CardTitle>
          <CardDescription>
            Ingresa tus datos para unirte a la comunidad.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="firstName">Nombres</Label>
                <Input
                  id="firstName"
                  placeholder="Juan"
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName">Apellidos</Label>
                <Input
                  id="lastName"
                  placeholder="Pérez"
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
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
            <div className="space-y-1">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Cuenta
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="underline">
              Iniciar sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
