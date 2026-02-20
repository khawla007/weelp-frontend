import React from 'react';

const AiSection = () => {
  return (
    <section className="container mx-auto flex gap-12 flex-col items-center py-4">
      <h2 className="text-[28px] font-medium text-Nileblue top-4">Your AI Travel Buddy</h2>
      <div className="flex">
        <div>
          <img src="/assets/images/AiChatassistant.png" alt="logo" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <img src="/assets/images/AiSuggestionMap.png" alt="logo" />
          <img src="/assets/images/AiSaveMoney.png" alt="logo" />
          <img src="/assets/images/AiPersonalised.png" className="pl-2 col-span-2" alt="logo" />
        </div>
      </div>
    </section>
  );
};

export default AiSection;
