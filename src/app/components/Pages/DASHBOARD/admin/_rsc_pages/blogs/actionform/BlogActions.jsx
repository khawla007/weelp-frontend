import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { createTag } from '@/lib/actions/tags'; // actions
import { createCategory } from '@/lib/actions/categories'; // actions
import { generateSlug } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export const ActionForm = ({ type, placeholder = 'Add value...', onSuccess }) => {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: {
      name: '',
      slug: '',
    },
  });

  const onSubmit = async (data) => {
    let response;

    const payload = {
      ...data,
      slug: generateSlug(data.name),
    };

    try {
      switch (type) {
        case 'tag':
          response = await createTag(payload);
          break;
        case 'category':
          response = await createCategory(payload);
          break;
        default:
          toast({ title: `${type} created successfully`, variant: 'destructive' });
          console.error('Invalid action type');
      }

      if (!response?.success) {
        toast({
          title: response?.message || 'Something went wrong',
          variant: 'destructive',
        });
        return;
      }

      toast({ title: `${type} created successfully` });
      reset();
      onSuccess?.();
    } catch (err) {
      console.error(err);
      toast({
        title: 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  return (
    <fieldset onClick={handleSubmit(onSubmit)} className="flex gap-4">
      <div className="flex-1">
        <Input placeholder={placeholder} {...register('name', { required: 'Field Required' })} disabled={isSubmitting} />
        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
      </div>

      <Button variant="secondary" disabled={isSubmitting} type="button">
        {isSubmitting ? <Loader2 className="animate-spin" /> : <Plus />}
      </Button>
    </fieldset>
  );
};
