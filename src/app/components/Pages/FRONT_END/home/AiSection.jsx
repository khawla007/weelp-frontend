import Image from 'next/image';
import { IMAGE_BLUR_DATA_URL } from '@/lib/imagePlaceholder';

const AiSection = () => {
  return (
    <section className="container-page flex flex-col items-center gap-10 pb-24 md:pb-28 lg:pb-32">
      <h2 className="text-center text-[28px] font-medium text-[#18181b]">An assistant for the small decisions.</h2>
      <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-stretch">
        <div className="relative w-full min-h-[300px] lg:w-[48%]">
          <Image
            src="/assets/images/AiChatassistant.png"
            alt="AI chat assistant"
            fill
            sizes="(max-width: 1024px) 100vw, 48vw"
            placeholder="blur"
            blurDataURL={IMAGE_BLUR_DATA_URL}
            className="rounded-[28px] object-cover"
          />
        </div>
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:w-[52%]">
          <div className="relative min-h-[200px]">
            <Image
              src="/assets/images/AiSuggestionMap.png"
              alt="AI suggestion map"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 26vw"
              placeholder="blur"
              blurDataURL={IMAGE_BLUR_DATA_URL}
              className="rounded-[28px] object-cover"
            />
          </div>
          <div className="relative min-h-[200px]">
            <Image
              src="/assets/images/AiSaveMoney.png"
              alt="AI save money suggestions"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 26vw"
              placeholder="blur"
              blurDataURL={IMAGE_BLUR_DATA_URL}
              className="rounded-[28px] object-cover"
            />
          </div>
          <div className="relative min-h-[200px] sm:col-span-2">
            <Image
              src="/assets/images/AiPersonalised.png"
              alt="AI personalised travel planning"
              fill
              sizes="(max-width: 1024px) 100vw, 52vw"
              placeholder="blur"
              blurDataURL={IMAGE_BLUR_DATA_URL}
              className="rounded-[28px] object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AiSection;
