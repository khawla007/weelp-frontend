import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const WidgetCard = ({ children, cardTitle = '' }) => {
  return (
    <Card>
      {cardTitle && (
        <CardHeader>
          <CardTitle>{cardTitle}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">{children}</div>
      </CardContent>
    </Card>
  );
};
