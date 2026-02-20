import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Card } from '@/components/ui/card';

/**
 * Dumb search input component
 * @param {object} props
 * @param {string} props.value - Controlled value
 * @param {function} props.onChange - Callback when input changes
 * @param {string} [props.placeholder] - Optional placeholder
 */
const InputFieldSearch = ({ value, onChange, placeholder = 'Search...' }) => {
  return (
    <Card className="flex items-center gap-2 px-2">
      <Search size={16} />
      <Input value={value} onChange={onChange} placeholder={placeholder} className="border-none focus-visible:ring-0 focus-visible:ring-offset-0" />
    </Card>
  );
};

export default InputFieldSearch;
