'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { log, stringSignRemover } from '@/lib/utils';
import axios from 'axios';

export const WhatAboutCity = ({ location_details }) => {
  const params = useParams();
  const pathname = usePathname();
  const { city } = params;

  const metaData = Object.entries(location_details ?? {}).length > 2 ? Object.entries(location_details).slice(2, 9) : [];

  return (
    <div className="p-6 sm:py-8 sm:px-16 xl:px-8 2xl:px-16">
      {metaData.length > 0 ? (
        <>
          <h5 className="font-medium text-[#143042] capitalize">What About</h5>
          <h2 className="font-semibold text-3xl text-[#143042] capitalize">{city}</h2>
          <ul className="bg-white grid grid-cols-2 justify-center shadow-sm rounded-md mt-8">
            {metaData.map((val, index) => {
              if (val[0] && val[1]) {
                return (
                  <li key={index} className="capitalize flex flex-col flex-wrap items-start p-2 sm:py-9 sm:px-13 odd:border-b odd:border-r even:border-b">
                    <h3 className="font-semibold px-8 text-sm sm:text-xl">{stringSignRemover(val?.[0])}</h3>
                    <span className="capitalize text-xs sm:text-sm font-medium px-8 text-grayDark">{val[1]}</span>
                  </li>
                );
              }
              return null; // Ensure that undefined elements are not rendered
            })}
          </ul>
        </>
      ) : null}
    </div>
  );
};

export const WhatAboutRegion = ({ regionMetaData, destinationInfo }) => {
  const { region } = useParams();
  return (
    <div className="p-6 sm:py-8  sm:px-16 xl:px-8 2xl:px-16 ">
      <h5 className="font-medium text-[#143042] capitalize">What About</h5>
      <h2 className="font-semibold text-3xl text-[#143042] capitalize">{region}</h2>
      {destinationInfo && destinationInfo.length > 0 ? (
        <ul className="bg-white grid grid-cols-2 justify-center shadow-sm rounded-md mt-8">
          {destinationInfo.map((val, index) => {
            return (
              <li key={index} className="capitalize flex flex-col flex-wrap items-start p-2 sm:py-9 sm:px-13 odd:border-b odd:border-r even:border-b">
                <h3 className="font-semibold px-8 text-sm sm:text-xl">{val.title}</h3>
                <span className="capitalize text-xs sm:text-sm font-medium px-8 text-grayDark">{val.description}</span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
};
