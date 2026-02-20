import Link from 'next/link';
import React from 'react';

/**  BookNow, BuyNow, Other Text Success Button
 */
const BuyNow = ({ text }) => {
  return text ? (
    <Link href={''}>
      <button className="bg-secondaryDark text-white font-normal text-lg py-3 px-12 rounded-lg capitalize">{text}</button>
    </Link>
  ) : (
    <Link href={''}>
      <button className="bg-secondaryDark text-white font-normal text-lg py-3 px-12 rounded-lg capitalize">buy now</button>
    </Link>
  );
};

export default BuyNow;
