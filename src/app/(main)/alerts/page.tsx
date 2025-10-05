import { PageHeader } from '@/components/page-header';
import { incidentReports, type IncidentReport } from '@/lib/data';
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
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{report.incidentType}</CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2">
              <MapPin className="size-3.5" />
              {report.location}
            </CardDescription>
          </div>
           <Badge
            variant={getRiskBadgeVariant(report.riskLevel)}
            className="capitalize"
          >
             <div className="flex items-center gap-2">
                {getRiskIcon(report.riskLevel)}
                <span>{report.riskLevel} Risk</span>
             </div>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{report.summary}</p>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground flex items-center gap-2">
        <Clock className="size-3.5" />
        <span>{new Date(report.time).toLocaleString()}</span>
      </CardFooter>
    </Card>
  );
}

export default function AlertsPage() {
  const sortedReports = [...incidentReports].sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  );
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Real-time Alerts"
        description="A live feed of incidents and safety alerts in your community."
      />
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {sortedReports.map((report) => (
          <AlertCard key={report.id} report={report} />
        ))}
      </div>
    </div>
  );
}
