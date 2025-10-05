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
        title="Welcome to SafeCity Guardian"
        description="Your unified platform for community safety and incident reporting."
      >
        <Button asChild>
          <Link href="/report">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Submit a Report
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Alerts"
          value={activeAlerts.toString()}
          icon={Siren}
          description="Medium and high-risk incidents"
        />
        <StatCard
          title="Reports Today"
          value={reportsToday.toString()}
          icon={Users}
          description="Total reports filed in last 24h"
        />
        <StatCard
          title="High-Risk Zones"
          value="2"
          icon={AlertTriangle}
          description="Oak St Park & Downtown Mall"
        />
        <StatCard
          title="Resolution Rate"
          value="78%"
          icon={ShieldCheck}
          description="Reported incidents addressed"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent High-Priority Incidents</CardTitle>
          <CardDescription>
            A summary of the most critical reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Incident</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead className="hidden md:table-cell">Time</TableHead>
                <TableHead className="text-right">Summary</TableHead>
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
                      {report.riskLevel}
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
