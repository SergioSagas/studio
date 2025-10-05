'use client';

import { PageHeader } from '@/components/page-header';
import { CrimePatternsChart } from '@/components/crime-patterns-chart';
import { fetchCrimePatternsAction } from '@/app/actions';
import { type IncidentReport } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { type DetectCrimePatternsOutput } from '@/ai/flows/detect-crime-patterns.flow';
import { Loader } from '@/components/ui/loader';

export default function PatternsPage() {
  const firestore = useFirestore();
  const [patternsData, setPatternsData] = useState<DetectCrimePatternsOutput | null>(null);
  const [isLoadingPatterns, setIsLoadingPatterns] = useState(true);

  const reportsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'incidentReports') : null),
    [firestore]
  );
  const { data: reports, isLoading: isLoadingReports } = useCollection<Omit<IncidentReport, 'id'>>(reportsQuery);

  useEffect(() => {
    if (reports) {
      setIsLoadingPatterns(true);
      fetchCrimePatternsAction(reports)
        .then(data => {
          setPatternsData(data);
        })
        .finally(() => {
          setIsLoadingPatterns(false);
        });
    } else if (!isLoadingReports) {
        setIsLoadingPatterns(false);
    }
  }, [reports, isLoadingReports]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Análisis de Patrones de Delincuencia"
        description="Información impulsada por IA sobre tendencias de incidentes y puntos calientes."
      />

      {isLoadingReports || isLoadingPatterns ? (
        <Card className="flex min-h-[300px] flex-col items-center justify-center">
            <Loader />
        </Card>
      ) : patternsData && patternsData.patterns.length > 0 ? (
        <CrimePatternsChart patterns={patternsData.patterns} />
      ) : (
        <Card className="flex min-h-[300px] flex-col items-center justify-center text-center">
            <CardHeader>
                <CardTitle>Sin Datos de Patrones</CardTitle>
                <CardDescription>
                    No se pudieron detectar patrones significativos a partir de los datos de informes actuales.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-full bg-muted p-4">
                    <AlertTriangle className="size-12 text-muted-foreground" />
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
