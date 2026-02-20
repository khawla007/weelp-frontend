'use client';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

const InputSearch = () => {
  const { register } = useFormContext();

  return (
    <div className="flex bg-card border rounded-md items-center px-4 max-w-xs">
      <Search size={16} />
      <Input type="search" placeholder="Search Reviews..." className="border-none focus-visible:ring-0 focus-visible:ring-offset-0" {...register('search')} />
    </div>
  );
};

export default InputSearch;
