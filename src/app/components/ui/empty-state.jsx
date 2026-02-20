'use client';

import React from 'react';
import { FileX, Package, Search, Calendar, Users } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

// Empty State for general use
export function EmptyState({
  title = 'No results found',
  description = 'Try adjusting your filters or search query',
  icon: Icon,
  action,
  actionLabel = 'Try again',
  className,
}) {
  const DefaultIcon = Package;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      <div className="w-full max-w-md">
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          {Icon ? (
            <Icon className="h-8 w-8 text-gray-400" />
          ) : (
            <DefaultIcon className="h-8 w-8 text-gray-400" />
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
            {description}
          </p>
        )}

        {/* Action Button */}
        {action && (
          <Button
            onClick={action}
            variant="outline"
            className="mx-auto"
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

// Empty State specific for tables
export function TableEmptyState({
  title = 'No data found',
  description,
  colSpan = 6,
  action,
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-8">
        <EmptyState
          title={title}
          description={description}
          icon={FileX}
          action={action}
          actionLabel="Add new item"
        />
      </td>
    </tr>
  );
}

// Empty State for search
export function SearchEmptyState({
  searchQuery,
  onClear,
}) {
  return (
    <EmptyState
      title={`No results for "${searchQuery}"`}
      description="Try different keywords or check your spelling"
      icon={Search}
      action={onClear}
      actionLabel="Clear search"
    />
  );
}

// Empty State for calendar/dates
export function CalendarEmptyState({
  title = 'No activities found',
  description = 'Try selecting different dates',
  action,
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={Calendar}
      action={action}
      actionLabel="Change dates"
    />
  );
}

// Empty State for users/people
export function UsersEmptyState({
  title = 'No users found',
  description = 'Add team members to get started',
  action,
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={Users}
      action={action}
      actionLabel="Invite user"
    />
  );
}

// Empty State with illustration slot
export function EmptyStateWithIllustration({
  illustration,
  title,
  description,
  action,
  actionLabel = 'Get started',
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Illustration */}
      {illustration && (
        <div className="mb-6">
          {illustration}
        </div>
      )}

      {/* Content */}
      <div className="w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

        {description && (
          <p className="text-sm text-gray-600 mb-6">
            {description}
          </p>
        )}

        {action && (
          <Button
            onClick={action}
            className="mx-auto"
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

// Minimal empty state for inline use
export function MinimalEmptyState({
  message = 'No items found',
  className,
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-center py-12 px-4 text-gray-500 text-sm',
        className
      )}
    >
      <p>{message}</p>
    </div>
  );
}
