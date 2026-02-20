'use client';

import { fetcher } from '@/lib/fetchers';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { isEmpty } from 'lodash';
import { VendorNoResultFound } from '../shared/VendorNoResultFound';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import dynamic from 'next/dynamic';
import { ArrowLeft } from 'lucide-react';

const CardSingleContactInformation = dynamic(() => import('../shared/vendor_cards').then((mod) => mod.CardSingleContactInformation), { ssr: false });
const CardSingleServiceInformation = dynamic(() => import('../shared/vendor_cards').then((mod) => mod.CardSingleServiceInformation), { ssr: false });
const CardSingleRouteCard = dynamic(() => import('../shared/vendor_cards').then((mod) => mod.CardSingleRouteCard), { ssr: false });

const SingleVendorPage = () => {
  const { vendorId } = useParams();
  const { data, error, isLoading } = useSWR(`/api/admin/vendors/${vendorId}`, fetcher); // get vendor by Id
  const router = useRouter();

  const vendorData = data?.data || {}; // destructure data
  if (isLoading) return <p className="loader"></p>; // loading ui

  if (error) return <p className="text-red-400">Some thing went Wrong</p>; // handle error boundaries

  if (!isLoading && isEmpty(vendorData)) return <VendorNoResultFound />; // hanlde 404 and empty object

  const { name = '', description = '', status = '', routes = [], vehicles = [] } = vendorData;

  return (
    <Card className="bg-inherit border-none shadow-none  ">
      <CardHeader className="flex flex-row justify-between px-4">
        <div className="w-full flex gap-2">
          <ArrowLeft onClick={() => router.back()} />
          <div>
            <CardTitle className="capitalize">{name}</CardTitle>
            <CardDescription className="first-letter:capitalize">{description}</CardDescription>
          </div>
        </div>

        <div>
          {/* status */}
          {status === 'active' && <Badge variant="success">{status}</Badge>}

          {status !== 'active' && <Badge variant="destructive">{status}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardSingleContactInformation {...vendorData} />
          <CardSingleServiceInformation routes={routes} vehicles={vehicles} />
        </div>
        <CardSingleRouteCard />
      </CardContent>
    </Card>
  );
};

export default SingleVendorPage;
