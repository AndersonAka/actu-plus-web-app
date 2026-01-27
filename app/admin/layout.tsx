import { DashboardLayout } from '@/components/templates';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout variant="admin">{children}</DashboardLayout>;
}
