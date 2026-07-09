'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { addCommabetweenString } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { generateSchema, getRecommendedSchemaType } from '@/lib/seo/schemaGenerator';

export const defaultSeoValues = {
  meta_title: '',
  meta_description: '',
  keywords: '',
  og_image_url: '',
  canonical_url: '',
  schema_type: 'Product',
  schema_data: {},
  head_code: '',
  body_code: '',
  footer_code: '',
};

export const parseSeoSchemaData = (value) => {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const schemaTypes = [
  {
    value: 'Product',
    label: 'Product',
    template: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: '',
      description: '',
      image: '',
      offers: {
        '@type': 'Offer',
        price: '',
        priceCurrency: 'USD',
      },
    },
  },
  {
    value: 'TouristAttraction',
    label: 'Tourist Attraction',
    template: {
      '@context': 'https://schema.org',
      '@type': 'TouristAttraction',
      name: '',
      description: '',
      image: '',
      address: {
        '@type': 'PostalAddress',
        addressLocality: '',
        addressRegion: '',
        addressCountry: '',
      },
    },
  },
  {
    value: 'TouristTrip',
    label: 'Tourist Trip',
    template: {
      '@context': 'https://schema.org',
      '@type': 'TouristTrip',
      name: '',
      description: '',
      touristType: {
        '@type': 'Audience',
        audienceType: '',
      },
      itinerary: {
        '@type': 'ItemList',
        itemListElement: [],
      },
    },
  },
  {
    value: 'Service',
    label: 'Service',
    template: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: '',
      description: '',
      provider: {
        '@type': 'Organization',
        name: '',
      },
    },
  },
  {
    value: 'BlogPosting',
    label: 'Blog Posting',
  },
  {
    value: 'Article',
    label: 'Article',
  },
];

const getGeneratedSchemaType = (schema, fallbackType) => {
  if (schema?.['@type']) return schema['@type'];

  const graphMainEntity = Array.isArray(schema?.['@graph'])
    ? schema['@graph'].find((node) => {
        const type = node?.['@type'];
        return type && type !== 'FAQPage' && type !== 'Review';
      })
    : null;

  return graphMainEntity?.['@type'] || fallbackType;
};

const getRequiredRule = (enabled, message) => (enabled ? { required: message } : {});

const SeoFields = ({ itemType = 'activity', requiredBasicFields = true }) => {
  const {
    register,
    control,
    setValue,
    setError,
    clearErrors,
    getValues,
    formState: { errors },
  } = useFormContext();

  const [jsonInput, setJsonInput] = useState('');
  const [validationState, setValidationState] = useState({
    isValid: true,
    message: '',
    showMessage: false,
  });

  const selectedSchemaData = useWatch({
    control,
    name: 'seo.schema_data',
  });
  const metaTitle = useWatch({
    control,
    name: 'seo.meta_title',
  });
  const metaDescription = useWatch({
    control,
    name: 'seo.meta_description',
  });

  useEffect(() => {
    setJsonInput(JSON.stringify(parseSeoSchemaData(selectedSchemaData), null, 2));
  }, [selectedSchemaData]);

  const handleSchemaTypeChange = (value, onChange) => {
    onChange(value);
    setValue('seo.schema_type', value, { shouldDirty: true });
  };

  const handleGenerateSchema = () => {
    const values = getValues();
    const schemaType = values?.seo?.schema_type || getRecommendedSchemaType(itemType);
    const schema = generateSchema({
      itemType,
      schemaType,
      values,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    });

    setValue('seo.schema_type', getGeneratedSchemaType(schema, schemaType), { shouldDirty: true });
    setValue('seo.schema_data', schema, { shouldDirty: true, shouldValidate: true });
    setJsonInput(JSON.stringify(schema, null, 2));
    clearErrors('seo.schema_data');
  };

  const parsedSchemaData = parseSeoSchemaData(selectedSchemaData);
  const hasSchemaData = Object.keys(parsedSchemaData).length > 0;

  const handleJsonUpdate = () => {
    let parsedSchema = null;
    let isValid = true;

    try {
      clearErrors('seo.schema_data');
      parsedSchema = String(jsonInput).trim() ? JSON.parse(jsonInput) : {};
      setValue('seo.schema_data', parsedSchema, { shouldDirty: true });
      setJsonInput(JSON.stringify(parsedSchema, null, 2));
    } catch {
      isValid = false;
    }

    setValidationState({
      isValid,
      message: isValid ? 'Success! Schema JSON is valid and has been updated.' : 'Error! Invalid JSON format. Please correct and try again.',
      showMessage: true,
    });

    if (!isValid) {
      setError('seo.schema_data', {
        type: 'manual',
        message: 'Invalid JSON format',
      });
    }

    setTimeout(() => {
      setValidationState((prevState) => ({
        ...prevState,
        showMessage: false,
      }));
    }, 3000);
  };

  const handleJsonInputChange = (value) => {
    setJsonInput(value);

    try {
      const parsedSchema = String(value).trim() ? JSON.parse(value) : {};
      setValue('seo.schema_data', parsedSchema, { shouldDirty: true });
      clearErrors('seo.schema_data');
    } catch {
      setError('seo.schema_data', {
        type: 'manual',
        message: 'Invalid JSON format',
      });
    }
  };

  return (
    <Accordion type="multiple" defaultValue={['item-1']} className="space-y-3">
      <AccordionItem value="item-1" className="rounded-md border px-3">
        <AccordionTrigger className="py-3 text-sm">
          <span>Basic Settings</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pb-3">
          <div className="space-y-2">
            <Label className={`${errors?.seo?.meta_title?.message && 'text-destructive'}`}>Meta Title</Label>
            <Input
              type="text"
              maxLength="60"
              placeholder="Enter meta title"
              {...register('seo.meta_title', getRequiredRule(requiredBasicFields, 'Meta Title Required'))}
            />
            <span className="block text-xs p-1 text-muted-foreground">{`${String(metaTitle || '').length}/60`} Characters</span>
            {errors?.seo?.meta_title && <p className="text-destructive text-sm">{errors?.seo?.meta_title?.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className={`${errors?.seo?.meta_description?.message && 'text-destructive'}`}>Meta Description</Label>
            <Input
              type="text"
              placeholder="Enter meta description"
              maxLength="160"
              {...register('seo.meta_description', getRequiredRule(requiredBasicFields, 'Meta Description Required'))}
            />
            <span className="block text-xs p-1 text-muted-foreground">{`${String(metaDescription || '').length}/160`} Characters</span>
            {errors?.seo?.meta_description && <p className="text-destructive text-sm">{errors?.seo?.meta_description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className={`${errors?.seo?.keywords?.message && 'text-destructive'}`}>Keywords</Label>
            <Input
              type="text"
              placeholder="Enter keywords separated by commas"
              {...register('seo.keywords', {
                ...getRequiredRule(requiredBasicFields, 'Keywords Required'),
                onBlur: (e) => {
                  const formatted = addCommabetweenString(e.target.value);
                  setValue('seo.keywords', formatted);
                },
              })}
            />
            {errors?.seo?.keywords && <p className="text-destructive text-sm">{errors?.seo?.keywords?.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className={`${errors?.seo?.og_image_url?.message && 'text-destructive'}`}>OG Image Url</Label>
            <Input
              type="text"
              placeholder="Enter OG Image Url"
              {...register('seo.og_image_url', getRequiredRule(requiredBasicFields, 'og_image_url Required'))}
            />
            {errors?.seo?.og_image_url && <p className="text-destructive text-sm">{errors?.seo?.og_image_url?.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className={`${errors?.seo?.canonical_url?.message && 'text-destructive'}`}>Canonical Url</Label>
            <Input
              type="text"
              placeholder="Enter canonical URL"
              {...register('seo.canonical_url', getRequiredRule(requiredBasicFields, 'canonical_url Required'))}
            />
            {errors?.seo?.canonical_url && <p className="text-destructive text-sm">{errors?.seo?.canonical_url?.message}</p>}
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2" className="rounded-md border px-3">
        <AccordionTrigger className="py-3 text-sm">
          <span>Schema Markup</span>
          {errors?.seo?.schema_data?.message && <span className="bg-destructive/15 text-destructive text-xs">{errors?.seo?.schema_data?.message}</span>}
        </AccordionTrigger>
        <AccordionContent className="flex flex-col pb-3">
          <Card className="p-8 space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="flex-1 space-y-2">
                <Label>Select Schema Type</Label>
                <Controller
                  control={control}
                  name="seo.schema_type"
                  defaultValue={getRecommendedSchemaType(itemType)}
                  render={({ field }) => (
                    <Select onValueChange={(value) => handleSchemaTypeChange(value, field.onChange)} value={field.value || getRecommendedSchemaType(itemType)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select schema" />
                      </SelectTrigger>
                      <SelectContent>
                        {schemaTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <Button type="button" variant="outline" onClick={handleGenerateSchema} className="md:mb-0">
                {hasSchemaData ? 'Regenerate Schema' : 'Generate Schema'}
              </Button>
            </div>

            <div>
              <Label>Edit JSON-LD</Label>
              <Textarea
                className={`font-mono text-sm h-96 resize-none ${validationState.showMessage ? (validationState.isValid ? 'border-success' : 'border-destructive') : ''}`}
                value={jsonInput}
                placeholder="Schema data will appear here..."
                onChange={(e) => handleJsonInputChange(e.target.value)}
              />
            </div>

            <Button type="button" onClick={handleJsonUpdate}>
              Validate & Update Schema
            </Button>

            {validationState.showMessage && (
              <div className={`p-4 rounded-md text-sm ${validationState.isValid ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}`}>{validationState.message}</div>
            )}
          </Card>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3" className="rounded-md border px-3">
        <AccordionTrigger className="py-3 text-sm">
          <span>Script Slots</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pb-3">
          <div className="space-y-2">
            <Label>Head Code</Label>
            <Textarea className="font-mono text-sm min-h-32" placeholder="Trusted head snippet" {...register('seo.head_code')} />
          </div>
          <div className="space-y-2">
            <Label>Body Code</Label>
            <Textarea className="font-mono text-sm min-h-32" placeholder="Trusted body snippet" {...register('seo.body_code')} />
          </div>
          <div className="space-y-2">
            <Label>Footer Code</Label>
            <Textarea className="font-mono text-sm min-h-32" placeholder="Trusted footer snippet" {...register('seo.footer_code')} />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default SeoFields;
