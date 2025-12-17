'use client';

import { PageHeader } from '@/components/page-header';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, limit } from 'firebase/firestore';
import { Loader } from '@/components/ui/loader';
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
import { MousePointerClick, Users, User, BarChart } from 'lucide-react';
import { type GlobalConfig, type ButtonStats, type UserStats } from '@/lib/analytics-types';

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
          <Loader className="h-10" />
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

function AnalyticsDashboard() {
  const firestore = useFirestore();

  // Queries
  const globalConfigRef = useMemoFirebase(() => firestore ? doc(firestore, 'config', 'dashboard') : null, [firestore]);
  const buttonStatsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'stats_botones'), orderBy('clicks', 'desc'), limit(10)) : null, [firestore]);
  const userStatsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'stats_usuarios'), orderBy('total_clicks', 'desc'), limit(10)) : null, [firestore]);
  const interactionsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'interacciones'), orderBy('timestamp', 'desc'), limit(10)) : null, [firestore]);

  // Data fetching
  const { data: globalConfig, isLoading: isLoadingConfig } = useDoc<GlobalConfig>(globalConfigRef);
  const { data: buttonStats, isLoading: isLoadingButtons } = useCollection<ButtonStats>(buttonStatsQuery);
  const { data: userStats, isLoading: isLoadingUsers } = useCollection<UserStats>(userStatsQuery);
  const { data: interactions, isLoading: isLoadingInteractions } = useCollection<any>(interactionsQuery);

  const isLoading = isLoadingConfig || isLoadingButtons || isLoadingUsers || isLoadingInteractions;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Clics"
          value={globalConfig?.total_clicks_plataforma?.toLocaleString() ?? '0'}
          icon={MousePointerClick}
          description="Clics totales en toda la plataforma."
          isLoading={isLoadingConfig}
        />
         <StatCard
          title="Usuarios Rastreados"
          value={userStats?.length.toString() ?? '0'}
          icon={Users}
          description="Usuarios únicos con actividad."
          isLoading={isLoadingUsers}
        />
        <StatCard
          title="Elementos Rastreados"
          value={buttonStats?.length.toString() ?? '0'}
          icon={BarChart}
          description="Botones y elementos interactivos."
          isLoading={isLoadingButtons}
        />
        <StatCard
          title="Interacciones Recientes"
          value={interactions?.length.toString() ?? '0'}
          icon={User}
          description="Últimos 10 eventos de clic."
          isLoading={isLoadingInteractions}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Elementos Más Populares</CardTitle>
            <CardDescription>
              Los botones y elementos con más interacciones.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingButtons ? <Loader /> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID del Elemento</TableHead>
                    <TableHead className="text-right">Clics</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buttonStats?.map((stat) => (
                    <TableRow key={stat.id}>
                      <TableCell className="font-mono text-xs">{stat.id}</TableCell>
                      <TableCell className="text-right font-bold">{stat.clicks.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usuarios Más Activos</CardTitle>
            <CardDescription>
              Los usuarios con mayor número de interacciones.
            </CardDescription>
          </CardHeader>
          <CardContent>
             {isLoadingUsers ? <Loader /> : (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Email del Usuario</TableHead>
                        <TableHead className="text-right">Clics Totales</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {userStats?.map((stat) => (
                        <TableRow key={stat.id}>
                        <TableCell>{stat.email}</TableCell>
                        <TableCell className="text-right font-bold">{stat.total_clicks.toLocaleString()}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
             )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default function AnalyticsPage() {

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Analítica de la Plataforma"
        description="Métricas de interacción del usuario y popularidad de funciones."
      />
      <AnalyticsDashboard />
    </div>
  );
}
