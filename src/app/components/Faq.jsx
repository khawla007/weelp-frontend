'use client';
import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);
  const pathName = usePathname();

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="accordion">
      {!pathName === '/booking' && <h2 className="text-lg sm:text-[28px] font-medium text-Nileblue py-6">FAQs</h2>}

      {items.map((item, index) => (
        <div key={index} className="mb-4 border-b border-gray-300 bg-white rounded-2xl shadow-sm border border-inherit">
          <div className="w-full flex items-center justify-between text-left p-4 font-semibold text-Nileblue cursor-pointer" onClick={() => handleToggle(index)}>
            {item.title}
            <ChevronRight className={`transition-transform duration-700 ${openIndex === index ? 'rotate-90' : ''}`} size={16} />
          </div>
          <div
            className={`overflow-hidden transition-transform duration-700 ease-in-out ${openIndex === index ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'}`}
            style={{
              transition: 'max-height 0.3s ease-in-out, opacity 0.3s ease-in-out',
            }}
          >
            <div className="p-4 pt-0 text-black-600">{item.content}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Accordion;
