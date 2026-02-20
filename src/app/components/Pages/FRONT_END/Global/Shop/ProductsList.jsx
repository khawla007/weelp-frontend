import React, { useState, useEffect } from 'react';
import SingleProductCard from '../../../../SingleProductCard';

const ProductsList = ({ data }) => {
  const [mounted, setMounted] = useState(false); // State to check if component is mounted

  // Use useEffect to set mounted to true on component mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Render nothing until the component is mounted
  }

  return (
    <div className="w-full lg:flex-[4]">
      <ul className="flex flex-col sm:flex-row sm:flex-wrap gap-y-4 gap-4 py-4 sm:py-12">
        {data.slice(0, 12).map((product) => (
          <li key={product.id}>
            <SingleProductCard productId={product.id} imgsrc={product.image} productTitle={product.name} productRating={product.rating} productPrice={product.price} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductsList;
