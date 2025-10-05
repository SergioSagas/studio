'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { analyzeReportAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ReportAnalysis } from '@/components/report-analysis';
import { Loader2, Send } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Send className="mr-2 h-4 w-4" />
      )}
      Analyze Report
    </Button>
  );
}

export function ReportForm() {
  const { toast } = useToast();
  const [state, formAction] = useFormState(analyzeReportAction, {
    status: 'idle',
  });

  useEffect(() => {
    if (state.status === 'success') {
      toast({
        title: 'Analysis Complete',
        description: state.message,
      });
    } else if (state.status === 'error') {
      toast({
        title: 'Analysis Failed',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Submit Incident Report</CardTitle>
          <CardDescription>
            Provide a detailed, anonymous description of the incident. The AI will
            analyze it for risk and type.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="reportText">Incident Details</Label>
              <Textarea
                id="reportText"
                name="reportText"
                placeholder="Describe the situation, location, and any other relevant details..."
                className="min-h-[150px]"
                required
              />
              {state.errors?.reportText && (
                <p className="text-sm text-destructive">
                  {state.errors.reportText[0]}
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
              <CardTitle>Awaiting Analysis</CardTitle>
              <CardDescription>
                Your report's AI analysis will appear here.
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
