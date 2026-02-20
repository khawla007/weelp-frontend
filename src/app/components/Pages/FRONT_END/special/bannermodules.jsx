import React from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

export const BannerSelectBox = () => {
  return (
    <div className="flex justify-center gap-4 mt-8">
      <Select>
        <SelectTrigger className="w-[180px] px-6 py-6 focus:ring-0 focus:ring-offset-0 border-none text-white opacity-80 font-light bg-[#3e526d]">
          <SelectValue className="" placeholder="Kashmir" />
        </SelectTrigger>
        <SelectContent className={'bg-[#3e526d] text-white mt-2 border-none outline-none'}>
          <SelectGroup>
            <SelectItem className={'focus:cursor-pointer sm:py-3'} value="apple">
              Apple
            </SelectItem>
            <SelectItem className={'focus:cursor-pointer sm:py-3'} value="banana">
              Banana
            </SelectItem>
            <SelectItem className={'focus:cursor-pointer sm:py-3'} value="blueberry">
              Blueberry
            </SelectItem>
            <SelectItem className={'focus:cursor-pointer sm:py-3'} value="grapes">
              Grapes
            </SelectItem>
            <SelectItem className={'focus:cursor-pointer sm:py-3'} value="pineapple">
              Pineapple
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="w-[180px] px-6 py-6 focus:ring-0 focus:ring-offset-0 border-none text-white opacity-80 font-light bg-[#3e526d]">
          <SelectValue className="" placeholder="Off Beat" />
        </SelectTrigger>
        <SelectContent className={'bg-[#3e526d] text-white mt-2 border-none'}>
          <SelectGroup>
            <SelectItem className={'focus:cursor-pointer sm:py-3 text-left'} value="apple">
              Apple
            </SelectItem>
            <SelectItem className={'focus:cursor-pointer sm:py-3 text-left'} value="banana">
              Banana
            </SelectItem>
            <SelectItem className={'focus:cursor-pointer sm:py-3 text-left'} value="blueberry">
              Blueberry
            </SelectItem>
            <SelectItem className={'focus:cursor-pointer sm:py-3 text-left'} value="grapes">
              Grapes
            </SelectItem>
            <SelectItem className={'focus:cursor-pointer sm:py-3 text-left'} value="pineapple">
              Pineapple
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
