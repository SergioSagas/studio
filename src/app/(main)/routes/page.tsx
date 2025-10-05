import { PageHeader } from '@/components/page-header';
import { RoutesForm } from '@/components/routes-form';

export default function SafeRoutesPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Safe Route Recommendations"
        description="Plan your journey with AI-powered safety analysis."
      />
      <RoutesForm />
    </div>
  );
}
