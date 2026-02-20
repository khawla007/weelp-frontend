import React from 'react';
import { Check } from 'lucide-react';
import { whiteCardData } from '../Data/ShopData';

export const CheckList = ({ data }) => {
  data = whiteCardData;
  if (data && data.length > 1) {
    return (
      <div>
        <ul className="grid grid-cols-2 justify-start gap-4">
          {data &&
            data.map((val, index) => {
              return (
                <li key={index} className="flex gap-2">
                  <Check /> {val.description}{' '}
                </li>
              );
            })}
        </ul>
      </div>
    );
  }
  return;
};
