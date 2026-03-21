'use client';

import { useState } from 'react';

/* Placeholder tab values from .pen design — not yet wired to API filtering */
const TABS = [
  { value: '', label: 'For You' },
  { value: 'family', label: 'Family-Friendly Activities' },
  { value: 'food', label: 'Food & Drinks' },
  { value: 'hidden', label: 'Hidden Gems' },
];

export default function CategoryTabs({ onTabChange }) {
  const [activeTab, setActiveTab] = useState('');

  const handleTabClick = (value) => {
    setActiveTab(value);
    onTabChange?.(value);
  };

  return (
    <div className="flex flex-wrap gap-3">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => handleTabClick(tab.value)}
          className={`weelp-city-tab rounded-[8.5px] px-5 py-2 transition-all ${
            activeTab === tab.value ? 'weelp-city-tab-active' : 'hover:border-[var(--weelp-city-tab-active-border)] hover:bg-white'
          }`}
          style={{
            fontFamily: 'var(--font-interTight), Inter Tight, sans-serif',
            fontWeight: activeTab === tab.value ? 600 : 500,
            fontSize: '16px',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
