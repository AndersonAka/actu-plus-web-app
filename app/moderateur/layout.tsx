import { DashboardLayout } from '@/components/templates';

export default function ModerateurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout variant="moderateur">{children}</DashboardLayout>;
}
