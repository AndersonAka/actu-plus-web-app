'use client';

import { cn } from '@/lib/utils/cn';
import { FileX, Search, Inbox } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: 'empty' | 'search' | 'inbox' | React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState = ({
  title,
  description,
  icon = 'empty',
  action,
  className,
}: EmptyStateProps) => {
  const icons: Record<string, React.ReactNode> = {
    empty: <FileX className="h-12 w-12 text-gray-400" />,
    search: <Search className="h-12 w-12 text-gray-400" />,
    inbox: <Inbox className="h-12 w-12 text-gray-400" />,
  };

  const iconElement = typeof icon === 'string' && icons[icon] ? icons[icon] : (typeof icon !== 'string' ? icon : icons['empty']);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className
      )}
    >
      <div className="mb-4">{iconElement}</div>
      <h3 className="mb-2 text-lg font-medium text-gray-900">{title}</h3>
      {description && (
        <p className="mb-4 max-w-sm text-sm text-gray-500">{description}</p>
      )}
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

export { EmptyState };
