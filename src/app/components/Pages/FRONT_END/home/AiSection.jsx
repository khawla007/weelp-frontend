import React from 'react';

const AiSection = () => {
  return (
    <section className="container mx-auto flex flex-col items-center gap-8 px-4 py-[70px]">
      <h2 className="text-center text-[28px] font-medium text-Nileblue">Your AI Travel Buddy</h2>
      <div className="flex w-full max-w-6xl flex-col gap-4 lg:flex-row lg:items-stretch">
        <div className="w-full lg:w-[48%]">
          <img src="/assets/images/AiChatassistant.png" alt="AI chat assistant" className="h-full w-full rounded-[28px] object-cover" />
        </div>
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:w-[52%]">
          <img src="/assets/images/AiSuggestionMap.png" alt="AI suggestion map" className="h-full w-full rounded-[28px] object-cover" />
          <img src="/assets/images/AiSaveMoney.png" alt="AI save money suggestions" className="h-full w-full rounded-[28px] object-cover" />
          <img src="/assets/images/AiPersonalised.png" className="h-full w-full rounded-[28px] object-cover sm:col-span-2" alt="AI personalised travel planning" />
        </div>
      </div>
    </section>
  );
};

export default AiSection;
