'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { PageInfo } from '../settings_shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

export const Settings = () => {
  const form = useForm({
    defaultValues: {
      theme: 'light',
      compactMode: false,
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
      autoSave: false,
    },
  });

  const { isDirty } = form.formState;

  const onSubmit = (data) => {
    console.log(data);
  };

  // console.log(isValid);

  return (
    <div className="space-y-6 w-full">
      <PageInfo pageTitle="General Settings" pageDescription="Manage your application preferences and settings" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Appearance</CardTitle>
              <CardDescription>Customize how the application looks and feels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theme</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue className="" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem className={''} value="light">
                          <Sun className="mr-2 h-4 w-4" /> Light
                        </SelectItem>
                        <SelectItem className={''} value="dark">
                          <Moon className="mr-2 h-4 w-4" /> Dark
                        </SelectItem>
                        <SelectItem className={''} value="system">
                          System
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="compactMode"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Compact Mode</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Regional Settings</CardTitle>
              <CardDescription>Configure your regional preferences</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {[
                {
                  name: 'language',
                  label: 'Language',
                  options: {
                    en: 'English',
                    es: 'Spanish',
                    fr: 'French',
                    de: 'German',
                  },
                },
                {
                  name: 'timezone',
                  label: 'Time Zone',
                  options: {
                    UTC: 'UTC',
                    'America/New_York': 'Eastern Time',
                    'America/Chicago': 'Central Time',
                    'America/Los_Angeles': 'Pacific Time',
                  },
                },
                {
                  name: 'dateFormat',
                  label: 'Date Format',
                  options: {
                    'MM/DD/YYYY': 'MM/DD/YYYY',
                    'DD/MM/YYYY': 'DD/MM/YYYY',
                    'YYYY-MM-DD': 'YYYY-MM-DD',
                  },
                },
                {
                  name: 'currency',
                  label: 'Currency',
                  options: {
                    USD: 'USD ($)',
                    EUR: 'EUR (€)',
                    GBP: 'GBP (£)',
                    JPY: 'JPY (¥)',
                  },
                },
              ].map(({ name, label, options }) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(options).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
              <CardDescription>Configure general application behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="autoSave"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Auto-save</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={!isDirty}>
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
