import React from 'react';

const TabButton = ({ text, className }) => {
  if (text) {
    return <button className={`${className} bg-graycolor text-grayDark font-medium text-md py-2 px-4 rounded-lg capitalize w-fit`}>{text}</button>;
  }
  return;
};

export default TabButton;
