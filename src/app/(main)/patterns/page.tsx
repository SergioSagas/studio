import { PageHeader } from '@/components/page-header';
import { CrimePatternsChart } from '@/components/crime-patterns-chart';
import { fetchCrimePatternsAction } from '@/app/actions';
import { incidentReports } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default async function PatternsPage() {
  const patternsData = await fetchCrimePatternsAction(incidentReports);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Análisis de Patrones de Delincuencia"
        description="Información impulsada por IA sobre tendencias de incidentes y puntos calientes."
      />

      {patternsData && patternsData.patterns.length > 0 ? (
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
