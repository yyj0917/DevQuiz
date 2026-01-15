import { Badge } from '@/components/ui/badge';
import type { ReportStatus } from '@/lib/constants/report';

type ReportStatusBadgeProps = {
  status: ReportStatus;
};

const STATUS_CONFIG = {
  pending: {
    label: '대기',
    variant: 'secondary' as const,
  },
  reviewed: {
    label: '검토중',
    variant: 'default' as const,
  },
  resolved: {
    label: '해결',
    variant: 'outline' as const,
  },
  rejected: {
    label: '반려',
    variant: 'destructive' as const,
  },
};

export function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
