// File Handle Shard Component Regarding Activities
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const NavigationActivity = ({ title, desciption }) => {
  const router = useRouter();
  if (title && desciption) {
    return (
      <div className="flex items-center gap-3 w-full py-4">
        <ArrowLeft className="cursor-pointer" onClick={() => router.back()} />

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{desciption}</p>
        </div>
      </div>
    );
  }
  return <div className="flex justify-between w-full py-4 font-extrabold"> Props Not Passed </div>;
};
