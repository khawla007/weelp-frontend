import React from 'react';
import Image from 'next/image';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getLogoUrl } from '@/lib/config/brand';

const HelpCenter = () => {
  return (
    <Card className="border-none bg-background shadow-none">
      <CardHeader className="px-4 md:px-8">
        <CardTitle className="text-xl font-medium text-foreground">Help Center</CardTitle>
        <CardDescription className="text-lg text-muted-foreground">Find answers, support, and product guidance.</CardDescription>
      </CardHeader>

      <div className="bg-weelp-sage-wash p-4 md:p-6 lg:min-h-screen xl:p-8">
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-6 text-center">
          <div className="flex items-center gap-3 text-foreground">
            <Image src={getLogoUrl()} alt="Weelp" width={43} height={74} className="h-14 w-auto" priority />
            <span className="text-3xl font-semibold">Weelp.</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-foreground md:text-4xl">Coming Soon</h1>
            <p className="max-w-md text-base text-muted-foreground md:text-lg">We&apos;re working on something amazing. Stay tuned!</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default HelpCenter;
