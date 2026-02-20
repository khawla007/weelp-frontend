'use client';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import dynamic from 'next/dynamic';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

const CreateVendorDriverForm = dynamic(() => import('../vendor_form/CreateVendorDriverForm'), { ssr: false }); // for lazy load

// Order Navigation
const CreateVendorDriverDialog = ({ title, desciption, label }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // title description
  if (title && desciption) {
    return (
      <Card className="flex justify-between w-full py-4 bg-inherit border-none shadow-none">
        <div className="w-full flex gap-2 flex-col sm:flex-row">
          <ArrowLeft onClick={() => router.back()} />
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-4">{title}</CardTitle>
            <CardDescription>{desciption}</CardDescription>
          </div>
        </div>

        {label && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setOpen(true)} className="bg-secondaryDark text-white">
                <span className="flex items-center gap-2">
                  <Plus size={16} />
                  {label}
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Driver</DialogTitle>
                <DialogDescription>Add a new driver to your team</DialogDescription>
              </DialogHeader>

              {/* Create Vendor Form*/}
              <CreateVendorDriverForm onSuccess={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </Card>
    );
  }
  return <div className="flex justify-between w-full py-4 font-extrabold"> Props Not Passed </div>;
};

export default CreateVendorDriverDialog;
