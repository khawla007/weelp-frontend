import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { generateSlug } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import DynamicSite from './dynamic_field/DynamicSite';

const BasicInformationTab = () => {
  const form = useFormContext();

  const handleBlur = () => {
    const name = form.getValues('name');
    const currentSlug = form.getValues('slug');
    const newSlug = generateSlug(name);

    // checking slug
    if (currentSlug !== newSlug) {
      form.setValue('slug', newSlug);
    }
  };

  return (
    <Card className="space-y-4 py-6 border-none">
      <CardTitle className="text-base font-semibold px-4">Basic Information</CardTitle>

      <CardContent className="grid gap-4 grid-cols-1 md:grid-cols-2 p-4">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          rules={{ required: 'Field Required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} onBlur={handleBlur} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Code */}
        <FormField
          control={form.control}
          name="code"
          rules={{ required: 'Field Required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input placeholder="e.g.. IND" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Slug */}
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input {...field} onBlur={handleBlur} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dynamic Field */}
        <DynamicSite />

        {/* Description */}
        <div className="md:col-span-2 ">
          <FormField
            control={form.control}
            name="description"
            rules={{ required: 'Field Required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Featured Destination  {BOOLEAN}*/}
        <div className="md:col-span-full">
          <FormField
            control={form.control}
            name="featured_destination"
            render={({ field }) => (
              <FormItem className="flex items-start gap-2">
                <FormControl>
                  <Switch className="data-[state=checked]:bg-secondaryDark" {...field} />
                </FormControl>
                <FormLabel>Featured Destination</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInformationTab;
