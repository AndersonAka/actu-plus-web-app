import { DashboardLayout } from '@/components/templates';

export default function VeilleurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout variant="veilleur">{children}</DashboardLayout>;
}
