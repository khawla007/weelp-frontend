'use client';

import { useState } from 'react';
import Image from 'next/image';
import Accordion from '@/app/components/Faq';
import TransferSearchForm from '@/app/components/Pages/FRONT_END/transfer/TransferSearchForm';
import TransferResultsDropdown from '@/app/components/Pages/FRONT_END/transfer/TransferResultsDropdown';
import ReviewSlider from '@/app/components/sliders/ReviewSlider';
import { faqItems } from '@/app/Data/ShopData';
import useMiniCartStore from '@/lib/store/useMiniCartStore';

const TransfersPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [meta, setMeta] = useState(null);
  const addItem = useMiniCartStore((s) => s.addItem);
  const setMiniCartOpen = useMiniCartStore((s) => s.setMiniCartOpen);

  const handleSelect = (transfer, extras = {}) => {
    const originName = transfer?.origin_name ?? transfer?.route?.origin?.name ?? null;
    const destinationName = transfer?.destination_name ?? transfer?.route?.destination?.name ?? null;
    const routeName = transfer?.route_name ?? transfer?.route?.name ?? null;
    const vehicleType = transfer?.vehicle_type ?? transfer?.vendorRoutes?.vehicle_type ?? null;

    const basePrice = Number(extras.base_price ?? transfer.route_price ?? 0);
    const luggageRate = Number(extras.luggage_per_bag_rate ?? transfer.luggage_per_bag_rate ?? 0);
    const waitingRate = Number(extras.waiting_per_minute_rate ?? transfer.waiting_per_minute_rate ?? 0);
    const bagCount = Number(extras.bag_count ?? 0);
    const waitingMinutes = Number(extras.waiting_minutes ?? 0);
    const luggageAmount = Math.round(luggageRate * bagCount * 100) / 100;
    const waitingAmount = Math.round(waitingRate * waitingMinutes * 100) / 100;
    const linePrice = Math.round((basePrice + luggageAmount + waitingAmount) * 100) / 100;

    addItem({
      type: 'transfer',
      id: transfer.id ?? transfer.transfer_id,
      name: transfer.name ?? vehicleType ?? 'Transfer',
      base_price: basePrice,
      unit_price: Number(extras.unit_price ?? transfer.route_price ?? 0),
      price_type: extras.price_type ?? transfer.price_type ?? 'per_vehicle',
      headcount: Number(extras.headcount ?? 1),
      price: linePrice,
      currency: transfer.route_currency ?? transfer.currency ?? 'USD',
      image: transfer.featured_image || transfer?.media?.[0]?.url || '/assets/images/Car.png',
      route_duration_minutes: transfer.route_duration_minutes,
      origin_name: originName,
      destination_name: destinationName,
      route_name: routeName,
      vehicle_type: vehicleType,
      luggage_per_bag_rate: luggageRate,
      waiting_per_minute_rate: waitingRate,
      bag_count: bagCount,
      waiting_minutes: waitingMinutes,
      luggage_amount: luggageAmount,
      waiting_amount: waitingAmount,
      howMany: {
        adults: meta?.adults ?? 1,
        children: meta?.children ?? 0,
        infants: meta?.infants ?? 0,
      },
      dateRange: { from: meta?.pickupAt ?? null },
    });
    setMiniCartOpen?.(true);
  };

  return (
    <>
      <section className="relative min-h-[320px] sm:min-h-[520px] flex justify-center bg-[#F5F9FA] p-6 pt-10 sm:pt-16">
        <div className="max-w-3xl w-full flex flex-col items-center gap-4 relative z-10">
          <h1 className="text-xl sm:text-5xl font-semibold text-[#143042] text-center">Book Your Taxi</h1>
          <p className="text-sm sm:text-lg font-medium text-grayDark text-center">
            You&apos;ll discover everything from whisky to Harry Potter, or even some bodysnatchers, in Scotland&apos;s captivating capital.
          </p>

          <div className="mt-4 w-full">
            <TransferSearchForm
              onResults={setResults}
              onLoadingChange={setLoading}
              onSubmitted={(m) => {
                setMeta(m ?? null);
                setOpen(true);
              }}
            />
          </div>

          <div className="w-full mx-auto md:w-[735px] mt-4">
            <TransferResultsDropdown open={open} loading={loading} transfers={results} onSelect={handleSelect} onClose={() => setOpen(false)} pickupAt={meta?.pickupAt} passengers={meta} />
          </div>
        </div>

        <Image className="hidden 2xl:block absolute -top-4 right-0 scale-90 pointer-events-none" src="/assets/Group5.png" alt="" width={500} height={300} />
      </section>

      <section className="relative">
        <div className="max-w-screen-xl w-full mx-auto productSlider space-y-8 p-4">
          <h2 className="text-3xl font-semibold text-Nileblue">Featured Review</h2>
          <ReviewSlider />
          <Accordion items={faqItems} />
        </div>
      </section>
    </>
  );
};

export default TransfersPage;
