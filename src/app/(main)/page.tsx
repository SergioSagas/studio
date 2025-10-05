import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Siren,
  Users,
} from 'lucide-react';
import { incidentReports, type IncidentReport } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/page-header';

function getRiskBadgeVariant(riskLevel: IncidentReport['riskLevel']) {
  if (riskLevel === 'high') return 'destructive';
  if (riskLevel === 'medium') return 'secondary';
  return 'default';
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const highPriorityIncidents = incidentReports
    .filter((report) => report.riskLevel === 'high')
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 5);

  const activeAlerts = incidentReports.filter(
    (r) => r.riskLevel === 'high' || r.riskLevel === 'medium'
  ).length;
  const reportsToday = incidentReports.filter(
    (r) =>
      new Date(r.time).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Bienvenido a Guardián CiudadSegura"
        description="Su plataforma unificada para la seguridad comunitaria y el reporte de incidentes."
      >
        <Button asChild>
          <Link href="/report">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Enviar un Reporte
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Alertas Activas"
          value={activeAlerts.toString()}
          icon={Siren}
          description="Incidentes de riesgo medio y alto"
        />
        <StatCard
          title="Reportes de Hoy"
          value={reportsToday.toString()}
          icon={Users}
          description="Reportes totales en las últimas 24h"
        />
        <StatCard
          title="Zonas de Alto Riesgo"
          value="2"
          icon={AlertTriangle}
          description="Parque Oak St y Centro Comercial"
        />
        <StatCard
          title="Tasa de Resolución"
          value="78%"
          icon={ShieldCheck}
          description="Incidentes reportados atendidos"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Incidentes Recientes de Alta Prioridad</CardTitle>
          <CardDescription>
            Un resumen de los reportes más críticos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Incidente</TableHead>
                <TableHead>Riesgo</TableHead>
                <TableHead className="hidden md:table-cell">Ubicación</TableHead>
                <TableHead className="hidden md:table-cell">Hora</TableHead>
                <TableHead className="text-right">Resumen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {highPriorityIncidents.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div className="font-medium">{report.incidentType}</div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getRiskBadgeVariant(report.riskLevel)}
                      className="capitalize"
                    >
                      {report.riskLevel === 'low' ? 'Bajo' : report.riskLevel === 'medium' ? 'Medio' : 'Alto'}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {report.location}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(report.time).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground truncate max-w-xs">
                    {report.summary}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
