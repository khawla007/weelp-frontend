'use client';

import { useRouter } from 'next/navigation';
import { Compass, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function QuickActions() {
  const router = useRouter();

  return (
    <div className="flex gap-4">
      <Button onClick={() => router.push('/explore-creators')} className="bg-weelp-sage-deep hover:bg-weelp-sage-deep/90 text-white">
        <Compass className="size-4 mr-2" />
        Explore Itineraries
      </Button>
      <Button onClick={() => router.push('/dashboard/customer/my-itineraries')} variant="outline" className="border-[#e4e4e7] text-[#52525b] hover:bg-[#f4f4f5]">
        <Route className="size-4 mr-2" />
        My Itineraries
      </Button>
    </div>
  );
}
