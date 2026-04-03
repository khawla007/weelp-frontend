import React from 'react';
import Image from 'next/image';

const AiSection = () => {
  return (
    <section className="container mx-auto flex flex-col items-center gap-8 px-4 pb-[100px]">
      <h2 className="text-center text-[28px] font-medium text-Nileblue">Your AI Travel Buddy</h2>
      <div className="flex w-full max-w-6xl flex-col gap-4 lg:flex-row lg:items-stretch">
        <div className="relative w-full min-h-[300px] lg:w-[48%]">
          <Image src="/assets/images/AiChatassistant.png" alt="AI chat assistant" fill className="rounded-[28px] object-cover" />
        </div>
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:w-[52%]">
          <div className="relative min-h-[200px]">
            <Image src="/assets/images/AiSuggestionMap.png" alt="AI suggestion map" fill className="rounded-[28px] object-cover" />
          </div>
          <div className="relative min-h-[200px]">
            <Image src="/assets/images/AiSaveMoney.png" alt="AI save money suggestions" fill className="rounded-[28px] object-cover" />
          </div>
          <div className="relative min-h-[200px] sm:col-span-2">
            <Image src="/assets/images/AiPersonalised.png" alt="AI personalised travel planning" fill className="rounded-[28px] object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AiSection;
