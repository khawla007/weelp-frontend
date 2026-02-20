import { Input } from '@/components/ui/input';
import React from 'react';
import { useFormContext } from 'react-hook-form';

export const SearchBar = ({ searchText = '' }) => {
  const { register } = useFormContext(); // retrieve all hook methods

  return <Input type="search" placeholder={searchText} {...register('query')} className="max-w-sm" />;
};
