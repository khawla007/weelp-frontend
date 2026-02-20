'use client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CreateVendorForm = dynamic(() => import('../vendor_form/CreateVendorForm'), { ssr: false }); // dynamic import form

// Order Navigation
const CreateVendorDialog = ({ title, desciption, label }) => {
  const [open, setOpen] = useState(false);

  // title description
  if (title && desciption) {
    return (
      <Card className="flex justify-between w-full py-4 bg-inherit border-none shadow-none ">
        <CardHeader className="p-0 ">
          <CardTitle className="text-2xl font-bold flex items-center gap-4">{title}</CardTitle>
          <CardContent className="px-0 text-sm text-muted-foreground">{desciption}</CardContent>
        </CardHeader>

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
                <DialogTitle>Add New Vendor</DialogTitle>
                <DialogDescription>Add a new transfer service provider to your network.</DialogDescription>
              </DialogHeader>
              {/* Create Vendor Form*/}
              <CreateVendorForm onSuccess={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </Card>
    );
  }
  return <div className="flex justify-between w-full py-4 font-extrabold"> Props Not Passed </div>;
};
export default CreateVendorDialog;
