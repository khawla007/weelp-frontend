import React from 'react';

const BreakSection = ({ className, marginTop, borderSpacing, borderColor }) => {
  return <hr className={`${className ?? ''} ${marginTop ?? 'mt-12'} border ${borderSpacing ?? 'border-spacing-1'} ${borderColor ?? 'border-[#E3E3E3A6]'} opacity-80`} />;
};

export default BreakSection;
