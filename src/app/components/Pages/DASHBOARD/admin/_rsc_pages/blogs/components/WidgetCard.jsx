import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const WidgetCard = ({ children, cardTitle = '', contentClassName = '', action = null }) => {
  return (
    <Card>
      {cardTitle && (
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
          <CardTitle style={{ fontSize: '0.875rem' }}>{cardTitle}</CardTitle>
          {action}
        </CardHeader>
      )}
      <CardContent className={contentClassName}>
        <div className={contentClassName ? '' : 'space-y-4'}>{children}</div>
      </CardContent>
    </Card>
  );
};
