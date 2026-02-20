import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CircleCheckBig, Truck } from 'lucide-react';
import React from 'react';

export const TransfertCard = () => {
  return (
    <Card className={'max-w-full sm:max-w-md p-0 '}>
      <CardHeader className={'flex flex-row p-0 items-center'}>
        <div className="flex-[3] flex flex-col gap-4 w-full py-4 px-8">
          <CardTitle>Private Transfer</CardTitle>
          <div className="flex flex-col">
            <p className="flex gap-2">
              <Truck /> <span>Swift Verna</span>
            </p>
            <p className="flex gap-2">
              <Calendar /> <span>3rd Oct 11:30 AM</span>
            </p>
          </div>
        </div>

        <div
          style={{
            backgroundImage: `url('/assets/images/Car.png')`,
            // backgroundPosition: "center",
          }}
          className="flex-[3] w-full h-40 bg-cover bg-left"
        />
      </CardHeader>
      <CardFooter className={'p-0 flex flex-col'}>
        <div className="bg-secondaryLight2 py-4 px-8 w-full flex  gap-2 sm:gap-4">
          <span className="capitalize flex gap-2  text-green-800">
            {' '}
            <CircleCheckBig /> live guide
          </span>
          <span className="capitalize flex gap-2  text-green-800">
            {' '}
            <CircleCheckBig /> live guide
          </span>
        </div>
        <div className="w-full flex py-4 px-8 items-center justify-between">
          <div className="flex flex-col w-full">
            <span className=" text-[#273F4E] font-semibold text-lg">$6,790.18</span>
            <span className="text-[#5A5A5A]">Detailed BreakDown</span>
          </div>
          <Button className={'bg-secondaryDark hover:bg-secondaryDark text-white max-w-full w-fit p-6 px-12'}>Select</Button>
        </div>
      </CardFooter>
    </Card>
  );
};
