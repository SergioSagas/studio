'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { planSafeRoutesAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RouteRecommendations } from '@/components/route-recommendations';
import { Loader2, Route } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Route className="mr-2 h-4 w-4" />
      )}
      Find Safe Routes
    </Button>
  );
}

export function RoutesForm() {
  const { toast } = useToast();
  const [state, formAction] = useFormState(planSafeRoutesAction, {
    status: 'idle',
  });

  useEffect(() => {
    if (state.status === 'success') {
      toast({
        title: 'Route Plan Ready',
        description: state.message,
      });
    } else if (state.status === 'error') {
      toast({
        title: 'Planning Failed',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Plan Your Journey</CardTitle>
          <CardDescription>
            Enter your start and end points to get AI-powered safe route
            recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="startLocation">Start Location</Label>
              <Input
                id="startLocation"
                name="startLocation"
                placeholder="e.g., City Hall"
                required
              />
              {state.errors?.startLocation && (
                <p className="text-sm text-destructive">
                  {state.errors.startLocation[0]}
                </p>
              )}
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="endLocation">End Location</Label>
              <Input
                id="endLocation"
                name="endLocation"
                placeholder="e.g., Central Library"
                required
              />
              {state.errors?.endLocation && (
                <p className="text-sm text-destructive">
                  {state.errors.endLocation[0]}
                </p>
              )}
            </div>
            <div>
              <Label>Transport Mode</Label>
              <RadioGroup
                name="transportMode"
                defaultValue="pedestrian"
                className="mt-2 grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem value="pedestrian" id="pedestrian" className="peer sr-only" />
                  <Label
                    htmlFor="pedestrian"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    Pedestrian
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
                    Public Transport
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
      <div>
        {state.status === 'success' && state.data ? (
          <RouteRecommendations recommendations={state.data} />
        ) : (
          <Card className="flex min-h-[400px] flex-col items-center justify-center text-center">
             <CardHeader>
                <CardTitle>Awaiting Route Plan</CardTitle>
                <CardDescription>
                    Your AI-generated routes will appear here.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-full bg-muted p-4">
                    <svg className="mx-auto size-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-.553-.894L15 2m-6 5l6-3m-6 5l6 3" />
                    </svg>
                </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
