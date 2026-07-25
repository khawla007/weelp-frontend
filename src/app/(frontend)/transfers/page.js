'use client';

import { useState } from 'react';
import Accordion from '@/app/components/Faq';
import TransferSearchForm from '@/app/components/Pages/FRONT_END/transfer/TransferSearchForm';
import TransferResultsDropdown from '@/app/components/Pages/FRONT_END/transfer/TransferResultsDropdown';
import ReviewSlider from '@/app/components/sliders/ReviewSlider';
import AnimatedGlobe from '@/app/components/ui/AnimatedGlobe';
import Reveal from '@/app/components/ui/Reveal';
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
      <section className="weelp-hero-rise relative z-50 mb-10 flex min-h-[360px] items-center justify-center bg-surface-tint px-4 py-8 sm:min-h-[420px] sm:p-6 md:mb-16 lg:mb-24">
        <div className="relative z-[60] flex w-full max-w-xl flex-col items-center gap-3 sm:max-w-3xl sm:gap-2">
          <h1 className="text-center text-3xl font-semibold text-foreground sm:text-5xl">
            <span className="weelp-rise-mask weelp-rise-mask--block">
              <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '200ms' }}>
                Book Your Taxi
              </span>
            </span>
          </h1>
          <p className="max-w-xl text-sm sm:text-lg font-medium text-weelp-steel text-center">
            <span className="weelp-rise-mask weelp-rise-mask--block">
              <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '280ms' }}>
                You&apos;ll discover everything from whisky to Harry Potter, or even some bodysnatchers, in Scotland&apos;s captivating capital.
              </span>
            </span>
          </p>

          <div className="weelp-hero-ui-rise relative z-[70] mt-1 w-full sm:mt-2" style={{ '--weelp-motion-delay': '360ms' }}>
            <TransferSearchForm
              onResults={setResults}
              onLoadingChange={setLoading}
              onSubmitted={(m) => {
                setMeta(m ?? null);
                setOpen(true);
              }}
            />

            {open ? (
              <div data-transfer-results-slot className="absolute inset-x-0 top-full z-[80] mt-3 w-full md:left-1/2 md:right-auto md:mt-4 md:w-[735px] md:-translate-x-1/2">
                <TransferResultsDropdown open={open} loading={loading} transfers={results} onSelect={handleSelect} onClose={() => setOpen(false)} pickupAt={meta?.pickupAt} passengers={meta} />
              </div>
            ) : null}
          </div>
        </div>

        <div data-transfers-globe-background className="hidden 2xl:block absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <AnimatedGlobe
            activationMediaQuery="(min-width: 1536px)"
            stageClassName="bg-transparent"
            shellClassName="bottom-[-180px] right-[-120px] z-[3] size-[760px] translate-x-0 translate-y-[40%] 2xl:size-[880px]"
            showLeftSparkles={false}
            showVignette={false}
          />
        </div>
      </section>

      <Reveal as="section" initialHidden className="relative">
        <div className="container-page productSlider space-y-8 pb-10 md:pb-16 lg:pb-24">
          <Reveal as="h2" variant="lift" className="text-3xl font-semibold text-foreground">
            Featured Review
          </Reveal>
          <Reveal variant="lift" delay={120}>
            <ReviewSlider />
          </Reveal>
          <Reveal variant="lift" delay={200}>
            <Accordion items={faqItems} />
          </Reveal>
        </div>
      </Reveal>
    </>
  );
};

export default TransfersPage;
