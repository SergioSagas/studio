'use client';

import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Siren,
  Users,
  Edit,
  Trash2
} from 'lucide-react';
import { type IncidentReport } from '@/lib/data';
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
import { useUserRole } from '@/hooks/useUserRole';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, deleteDoc, query, orderBy, limit } from 'firebase/firestore';
import { Loader } from '@/components/ui/loader';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
  isLoading = false,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  description: string;
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <Loader className='h-10' />
        ) : (
            <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
            </>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { role } = useUserRole();
  const { toast } = useToast();
  const firestore = useFirestore();

  const reportsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'incidentReports') : null),
    [firestore]
  );
  
  const highPriorityQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'incidentReports'), orderBy('reportTime', 'desc'), limit(5)) : null),
    [firestore]
  );

  const { data: reports, isLoading: isLoadingReports } = useCollection<Omit<IncidentReport, 'id'>>(reportsQuery);
  const { data: highPriorityIncidents, isLoading: isLoadingHighPriority } = useCollection<Omit<IncidentReport, 'id'>>(highPriorityQuery);


  const activeAlerts = useMemo(() => reports?.filter(
    (r) => r.riskLevel === 'high' || r.riskLevel === 'medium'
  ).length ?? 0, [reports]);

  const reportsToday = useMemo(() => reports?.filter(
    (r) =>
      new Date(r.reportTime).toDateString() === new Date().toDateString()
  ).length ?? 0, [reports]);
  
  const highRiskZones = useMemo(() => {
    if (!reports) return { count: 0, names: 'Calculando...' };

    const riskCountsByLocation = reports
      .filter(r => r.riskLevel === 'high' || r.riskLevel === 'medium')
      .reduce((acc, report) => {
        const location = report.location;
        acc[location] = (acc[location] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const sortedZones = Object.entries(riskCountsByLocation)
      .sort(([, a], [, b]) => b - a)
      .map(([location]) => location);

    const topZones = sortedZones.slice(0, 2);

    return {
      count: topZones.length,
      names: topZones.length > 0 ? topZones.join(' y ') : 'No hay zonas de alto riesgo',
    };
  }, [reports]);

  const handleDelete = (id: string) => {
    if (!firestore) return;
    const reportRef = doc(firestore, 'incidentReports', id);
    deleteDocumentNonBlocking(reportRef);
    toast({
      title: "Incidente eliminado",
      description: "El reporte de incidente ha sido eliminado.",
    });
  };

  const handleEdit = (id: string) => {
    // In a real app, this would open a modal or navigate to an edit page
    toast({
      title: "Función no implementada",
      description: "La edición de incidentes aún no está disponible.",
    });
  }

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
          isLoading={isLoadingReports}
        />
        <StatCard
          title="Reportes de Hoy"
          value={reportsToday.toString()}
          icon={Users}
          description="Reportes totales en las últimas 24h"
          isLoading={isLoadingReports}
        />
        <StatCard
          title="Zonas de Alto Riesgo"
          value={highRiskZones.count.toString()}
          icon={AlertTriangle}
          description={highRiskZones.names}
          isLoading={isLoadingReports}
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
          <CardTitle>Incidentes Recientes</CardTitle>
          <CardDescription>
            Un resumen de los reportes más recientes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHighPriority ? (
            <Loader className='h-48' />
          ) : (
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Incidente</TableHead>
                    <TableHead>Riesgo</TableHead>
                    <TableHead className="hidden md:table-cell">Ubicación</TableHead>
                    <TableHead className="hidden md:table-cell">Hora</TableHead>
                    <TableHead>Resumen</TableHead>
                    {role === 'admin' && <TableHead className="text-right">Acciones</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {highPriorityIncidents?.map((report) => (
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
                        {new Date(report.reportTime).toLocaleString()}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-default">{report.summary}</span>
                          </TooltipTrigger>
                          <TooltipContent side="top" align="start" className="max-w-sm whitespace-normal">
                            <p>{report.summary}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      {role === 'admin' && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(report.id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(report.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TooltipProvider>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
