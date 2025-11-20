'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/icons';

const loginSchema = z.object({
  email: z.string().email({ message: 'Por favor ingresa un email válido.' }),
  password: z
    .string()
    .min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
  role: z.enum(['user', 'admin', 'security'], {
    required_error: 'Debes seleccionar un rol.',
  }),
});

type LoginInput = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const app = useFirebaseApp();
  const firestore = useFirestore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: 'user',
    },
  });

  const role = watch('role');

  const onSubmit = async (data: LoginInput) => {
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
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        if (data.role === 'user') {
          await setDoc(userDocRef, {
            email: user.email,
            role: 'user',
            firstName: 'Usuario',
            lastName: 'Nuevo',
            reputation: 10,
          });
        } else {
           await auth.signOut();
           throw new Error(`El perfil de ${data.role} no existe.`);
        }
      } else if (userDoc.data().role !== data.role) {
        await auth.signOut();
        throw new Error('No tienes permiso para iniciar sesión con el rol seleccionado.');
      }

      toast({
        title: 'Inicio de sesión exitoso',
        description: 'Bienvenido de nuevo.',
      });
      router.push('/');
    } catch (error: any) {
      console.error('Login error:', error);
      let description = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        description = 'El correo electrónico o la contraseña son incorrectos.';
      } else if (error.message) {
        description = error.message;
      }
      
      toast({
        variant: 'destructive',
        title: 'Error al iniciar sesión',
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
          <CardTitle>Iniciar Sesión</CardTitle>
          <CardDescription>
            Accede a tu cuenta para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
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
            <div className="space-y-2">
              <Label>Iniciar sesión como</Label>
              <RadioGroup
                value={role}
                onValueChange={(value) =>
                  setValue('role', value as 'user' | 'admin' | 'security')
                }
                className="grid grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="user"
                    id="user"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="user"
                    className="flex h-full flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    Usuario
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="admin"
                    id="admin"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="admin"
                    className="flex h-full flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    Admin
                  </Label>
                </div>
                 <div>
                  <RadioGroupItem
                    value="security"
                    id="security"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="security"
                    className="flex h-full flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    Seguridad
                  </Label>
                </div>
              </RadioGroup>
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Iniciar Sesión
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            ¿No tienes una cuenta?{' '}
            <Link href="/signup" className="underline">
              Crear cuenta
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
