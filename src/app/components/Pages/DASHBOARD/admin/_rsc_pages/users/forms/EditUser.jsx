'use client';

import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { editUserAdmin } from '@/lib/actions/userActions';
import { NavigationUser } from '../components/NavigationUser';
import { FormActionButtons } from '@/app/components/Button/FormActionButtons';

// Updated schema - password optional for edit
const userFormSchema = z
  .object({
    name: z.string().min(3, { message: 'Username must be at least 3 characters' }).max(50, { message: 'Username must be less than 50 characters' }),
    email: z.string().email({ message: 'Please enter a valid email address' }),
    password: z.string().optional(),
    confirm_password: z.string().optional(),
    role: z.enum(['super_admin', 'customer', 'admin'], {
      required_error: 'Please select a role',
    }),
    status: z.enum(['active', 'inactive'], {
      required_error: 'Please select a status',
    }),
  })
  .refine(
    (data) => {
      // Only validate password match if password is provided
      if (data.password && data.password !== data.confirm_password) {
        return false;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ['confirm_password'],
    },
  )
  .refine(
    (data) => {
      // Only validate password strength if password is provided
      if (data.password && data.password.length > 0) {
        return data.password.length >= 8 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/.test(data.password);
      }
      return true;
    },
    {
      message: 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
      path: ['password'],
    },
  );

export default function EditUserForm({ userData = {} }) {
  console.log(userData);
  const router = useRouter();
  const { toast } = useToast();

  // Complete defaultValues matching the schema
  const defaultValues = {
    name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'customer',
    status: 'active',
    ...userData,
  };
  // Initialize form with proper resolver and defaultValues
  const form = useForm({
    resolver: zodResolver(userFormSchema),
    defaultValues,
    mode: 'onChange', // Enable real-time validation
  });

  // const formstatus
  const { isSubmitting, isValid, isDirty } = form.formState;

  // handle on submit
  async function onSubmit(data) {
    console.log('form data', data);
    try {
      const response = await editUserAdmin(userData.id, data);

      if (!response.success) {
        // Extract first error message dynamically
        const msg = response.errors?.email?.[0] ?? response.errors?.password?.[0] ?? response.errors?.username?.[0] ?? 'Invalid input provided.';

        // Display error toast
        toast({
          variant: 'destructive',
          title: msg,
        });

        return;
      }

      // Success message
      toast({
        title: response?.data?.message || 'User Updated successfully.',
      });

      // Reset form after success
      form.reset();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Something went wrong. Please try again.',
      });
    }
  }

  console.log(form.formState);
  return (
    <div className="space-y-4">
      <NavigationUser title="Edit User" content="Edit a user Account" />
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Edit the details for the user account.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <fieldset disabled={isSubmitting} className={`${isSubmitting ? 'cursor-wait' : 'cursor-pointer'}`}>
            {/* Disblae Form on Submiting*/}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormDescription>This will be the user&apos;s login name</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormDescription>Work email address</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Password <span className="text-muted-foreground">(Optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Leave empty to keep current" {...field} />
                        </FormControl>
                        <FormDescription>Must be at least 8 characters with uppercase, lowercase, number and special character</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirm_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Confirm Password <span className="text-muted-foreground">(Optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Leave empty to keep current" {...field} />
                        </FormControl>
                        <FormDescription>Re-enter the password only if changing it</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>User&apos;s role and permissions</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Account status</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <FormActionButtons
                  mode="update"
                  cancelHref="/dashboard/admin/users"
                  isSubmitting={isSubmitting}
                  isDisabled={!isDirty}
                  cancelAlwaysEnabled={true}
                  containerType="div"
                  className="justify-end"
                />
              </CardFooter>
            </form>
          </fieldset>
        </Form>
      </Card>
    </div>
  );
}
