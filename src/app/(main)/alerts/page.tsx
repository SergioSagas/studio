'use client';
import { PageHeader } from '@/components/page-header';
import { type IncidentReport } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  AlertTriangle,
  CheckCircle,
  ShieldQuestion,
  MapPin,
  Clock,
} from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Loader } from '@/components/ui/loader';
import { cleanLocationName } from '@/lib/utils';

function getRiskBadgeVariant(riskLevel: IncidentReport['riskLevel']) {
  if (riskLevel === 'high') return 'destructive';
  if (riskLevel === 'medium') return 'secondary';
  return 'default';
}

function getRiskIcon(riskLevel: IncidentReport['riskLevel']) {
  if (riskLevel === 'high') return <AlertTriangle className="size-5 text-destructive" />;
  if (riskLevel === 'medium') return <ShieldQuestion className="size-5 text-yellow-500" />;
  return <CheckCircle className="size-5 text-green-500" />;
}

function AlertCard({ report }: { report: IncidentReport }) {
  const riskLevelText = report.riskLevel === 'low' ? 'Bajo' : report.riskLevel === 'medium' ? 'Medio' : 'Alto';
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{report.incidentType}</CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2">
              <MapPin className="size-3.5" />
              {cleanLocationName(report.location)}
            </CardDescription>
          </div>
           <Badge
            variant={getRiskBadgeVariant(report.riskLevel)}
            className="capitalize"
          >
             <div className="flex items-center gap-2">
                {getRiskIcon(report.riskLevel)}
                <span>{riskLevelText} Riesgo</span>
             </div>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{report.summary}</p>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground flex items-center gap-2">
        <Clock className="size-3.5" />
        <span>{new Date(report.reportTime).toLocaleString()}</span>
      </CardFooter>
    </Card>
  );
}

export default function AlertsPage() {
  const firestore = useFirestore();

  const reportsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'incidentReports'), orderBy('reportTime', 'desc'))
        : null,
    [firestore]
  );
  
  const { data: reports, isLoading } = useCollection<Omit<IncidentReport, 'id'>>(reportsQuery);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Alertas en Tiempo Real"
        description="Un feed en vivo de incidentes y alertas de seguridad en tu comunidad."
      />
      {isLoading ? (
        <Loader className="h-64" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {reports?.map((report) => (
            <AlertCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
