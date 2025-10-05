import type { RecommendSafeRoutesOutput } from '@/ai/flows/recommend-safe-routes.flow';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Check, ShieldAlert, ShieldCheck, Footprints, Bus } from 'lucide-react';

export function RouteRecommendations({
  recommendations,
}: {
  recommendations: RecommendSafeRoutesOutput;
}) {
  const getRiskIcon = (risk: string) => {
    const riskLower = risk.toLowerCase();
    if (riskLower.includes('alto') || riskLower.includes('peligro')) {
      return <ShieldAlert className="size-5 text-destructive" />;
    }
    if (riskLower.includes('medio') || riskLower.includes('precaución')) {
      return <ShieldCheck className="size-5 text-yellow-500" />;
    }
    return <Check className="size-5 text-green-500" />;
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Recomendaciones de Ruta de IA</CardTitle>
        <CardDescription>
          Basado en datos actuales, aquí están las rutas más seguras para tu viaje.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-semibold text-primary">Recomendación General</h4>
          <p className="text-sm text-primary/80">
            {recommendations.overallRecommendation}
          </p>
        </div>
        <Accordion type="single" collapsible defaultValue="item-0">
          {recommendations.safeRoutes.map((route, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  {getRiskIcon(route.riskAssessment)}
                  <span>Opción de Ruta {index + 1}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 pl-2">
                <p className="text-sm font-semibold">Detalles de la Ruta:</p>
                <p className="text-sm text-muted-foreground">{route.routeDescription}</p>
                <p className="text-sm font-semibold mt-2">Evaluación de Riesgo:</p>
                <p className="text-sm text-muted-foreground">{route.riskAssessment}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
