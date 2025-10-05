import type { AnalyzeCitizenReportOutput } from '@/ai/flows/analyze-citizen-reports.flow';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertTriangle, CheckCircle, ShieldQuestion } from 'lucide-react';

function getRiskBadgeVariant(riskLevel: AnalyzeCitizenReportOutput['riskLevel']) {
  if (riskLevel === 'high') return 'destructive';
  if (riskLevel === 'medium') return 'secondary';
  return 'default';
}

function getRiskIcon(riskLevel: AnalyzeCitizenReportOutput['riskLevel']) {
  if (riskLevel === 'high') return <AlertTriangle className="size-5 text-destructive" />;
  if (riskLevel === 'medium') return <ShieldQuestion className="size-5 text-yellow-500" />;
  return <CheckCircle className="size-5 text-green-500" />;
}

export function ReportAnalysis({
  analysis,
}: {
  analysis: AnalyzeCitizenReportOutput;
}) {
  const riskLevelText = analysis.riskLevel === 'low' ? 'Bajo' : analysis.riskLevel === 'medium' ? 'Medio' : 'Alto';
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Resultado del Análisis de IA</CardTitle>
        <CardDescription>
          Nuestra IA ha analizado el informe y lo ha clasificado de la siguiente manera.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <span className="text-sm font-medium">Tipo de Incidente</span>
          <Badge variant="outline">{analysis.incidentType}</Badge>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <span className="text-sm font-medium">Nivel de Riesgo Evaluado</span>
          <div className="flex items-center gap-2">
            {getRiskIcon(analysis.riskLevel)}
            <Badge
              variant={getRiskBadgeVariant(analysis.riskLevel)}
              className="capitalize"
            >
              {riskLevelText}
            </Badge>
          </div>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-medium">Resumen Anonimizado</h4>
          <p className="text-sm text-muted-foreground">{analysis.summary}</p>
        </div>
      </CardContent>
    </Card>
  );
}
