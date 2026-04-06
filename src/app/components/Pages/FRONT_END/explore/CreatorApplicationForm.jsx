'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { submitCreatorApplication } from '@/lib/actions/creatorApplications';
import { useToast } from '@/hooks/use-toast';

export default function CreatorApplicationForm({ open, onOpenChange }) {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      gender: '',
      instagram: '',
      phone: '',
      youtube: '',
      facebook: '',
    },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('gender', data.gender);
    formData.append('instagram', data.instagram);
    formData.append('phone', data.phone);
    if (data.youtube) formData.append('youtube', data.youtube);
    if (data.facebook) formData.append('facebook', data.facebook);

    const result = await submitCreatorApplication(formData);

    if (result.success) {
      toast({ title: 'Application submitted!', description: result.message || 'We will review your application shortly.' });
      reset();
      onOpenChange(false);
    } else {
      toast({ title: 'Submission failed', description: result.message, variant: 'destructive' });
    }

    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#142A38] text-xl">Apply to Become a Creator</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="name" className="text-[#435A67] text-sm font-medium">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Your full name"
              className="mt-1.5"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-[#435A67] text-sm font-medium">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="mt-1.5"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
              })}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* Gender */}
          <div>
            <Label className="text-[#435A67] text-sm font-medium">
              Gender <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="gender"
              control={control}
              rules={{ required: 'Gender is required' }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
          </div>

          {/* Instagram */}
          <div>
            <Label htmlFor="instagram" className="text-[#435A67] text-sm font-medium">
              Instagram <span className="text-red-500">*</span>
            </Label>
            <Input
              id="instagram"
              placeholder="@yourhandle"
              className="mt-1.5"
              {...register('instagram', { required: 'Instagram handle is required' })}
            />
            {errors.instagram && <p className="text-red-500 text-xs mt-1">{errors.instagram.message}</p>}
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone" className="text-[#435A67] text-sm font-medium">
              Phone <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 234 567 890"
              className="mt-1.5"
              {...register('phone', { required: 'Phone number is required' })}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          {/* YouTube (optional) */}
          <div>
            <Label htmlFor="youtube" className="text-[#435A67] text-sm font-medium">
              YouTube <span className="text-[#5A5A5A] text-xs font-normal">(optional)</span>
            </Label>
            <Input
              id="youtube"
              placeholder="https://youtube.com/@yourchannel"
              className="mt-1.5"
              {...register('youtube')}
            />
          </div>

          {/* Facebook (optional) */}
          <div>
            <Label htmlFor="facebook" className="text-[#435A67] text-sm font-medium">
              Facebook <span className="text-[#5A5A5A] text-xs font-normal">(optional)</span>
            </Label>
            <Input
              id="facebook"
              placeholder="https://facebook.com/yourprofile"
              className="mt-1.5"
              {...register('facebook')}
            />
          </div>

          {/* Submit */}
          <Button type="submit" disabled={submitting} className="w-full bg-secondaryDark hover:bg-secondaryDark/90 text-white">
            {submitting ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
            {submitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
