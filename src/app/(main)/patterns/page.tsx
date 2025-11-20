'use client';

import { PageHeader } from '@/components/page-header';
import { CrimePatternsChart } from '@/components/crime-patterns-chart';
import { fetchCrimePatternsAction } from '@/app/actions';
import { type IncidentReport } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, MapPin, Target, ShieldCheck } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { type DetectCrimePatternsOutput } from '@/ai/flows/detect-crime-patterns.flow';
import { Loader } from '@/components/ui/loader';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

function AnalysisCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

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
    if (reports && reports.length > 0) {
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
  
  const hasData = patternsData && patternsData.patterns.length > 0;
  const hasAnalysis = hasData && patternsData.analysis;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Análisis de Patrones de Delincuencia"
        description="Información impulsada por IA sobre tendencias de incidentes y puntos calientes."
      />

      {isLoadingReports || isLoadingPatterns ? (
        <Card className="flex min-h-[400px] flex-col items-center justify-center">
            <Loader />
            <p className="mt-4 text-sm text-muted-foreground">La IA está analizando los datos...</p>
        </Card>
      ) : hasData ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
              <AnalysisCard title="Puntos Calientes" icon={MapPin}>
                {hasAnalysis && patternsData.analysis.hotspots.length > 0 ? (
                    <div className="space-y-2">
                        {patternsData.analysis.hotspots.map((spot, index) => (
                             <div key={index} className="flex items-center gap-2">
                                <Badge variant="destructive" className="text-lg">{index + 1}</Badge>
                                <p className="text-lg font-bold">{spot}</p>
                            </div>
                        ))}
                    </div>
                ): <p className="text-sm text-muted-foreground">No se identificaron puntos calientes.</p>}
              </AnalysisCard>

              <AnalysisCard title="Patrón Principal" icon={Target}>
                <p className="text-lg font-bold">
                    {hasAnalysis ? patternsData.analysis.mainPattern : 'No se detectó un patrón claro.'}
                </p>
              </AnalysisCard>
              
              <AnalysisCard title="Recomendación de IA" icon={ShieldCheck}>
                 <p className="text-sm text-foreground">
                    {hasAnalysis ? patternsData.analysis.recommendation : 'No hay recomendaciones por el momento.'}
                </p>
              </AnalysisCard>
          </div>
           <div className="lg:col-span-3">
             <CrimePatternsChart patterns={patternsData.patterns} />
           </div>
        </div>
      ) : (
        <Card className="flex min-h-[300px] flex-col items-center justify-center text-center">
            <CardHeader>
                <CardTitle>Sin Datos Suficientes para Análisis</CardTitle>
                <CardDescription>
                    No hay suficientes informes de incidentes para detectar patrones significativos.
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
