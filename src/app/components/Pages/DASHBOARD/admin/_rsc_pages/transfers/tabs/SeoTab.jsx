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

// SEO Tab
const SeoTab = () => {
  //schema types
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
  ];

  const [openItem, setOpenItem] = useState('item-1'); // set default open
  const {
    register,
    control,
    setValue,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext();

  const [jsonInput, setJsonInput] = useState('');
  const [validationState, setValidationState] = useState({
    isValid: true,
    message: '',
    showMessage: false,
  });

  // Get selected schema type from form
  const selectedSchemaType = useWatch({
    control,
    name: 'seo.schema_type',
  });

  // GET selected schema data from form
  const selectedSchemaData = useWatch({
    control,
    name: 'seo.schema_data',
  });

  // Meta Title
  const metaTitle = useWatch({
    control,
    name: 'seo.meta_title',
  });

  // Meta Description
  const metaDescription = useWatch({
    control,
    name: 'seo.meta_description',
  });

  // Sync selectedSchemaType with JSON template
  useEffect(() => {
    const selectedSchema = schemaTypes.find((s) => s.value === selectedSchemaType);
    if (selectedSchema) {
      setJsonInput(JSON.stringify(selectedSchema.template, null, 2));
    }
  }, [selectedSchemaType]);

  // update with latest value
  useEffect(() => {
    if (!String(jsonInput).trim()) {
      setJsonInput(JSON.stringify(selectedSchemaData || {}, null, 2));
    }
  }, [selectedSchemaData]);

  // Handle JSON validation and update
  const handleJsonUpdate = () => {
    // Validate JSON only when button is clicked
    let isValid = true;
    try {
      // Clear any previous errors
      clearErrors('schema_data');

      if (String(jsonInput).trim()) {
        setJsonInput(JSON.parse(jsonInput));
        setValue('seo.schema_data', JSON.parse(jsonInput));
      } else {
        isValid = false;
      }
    } catch (error) {
      isValid = false;
    }

    // Update validation state
    setValidationState({
      isValid,
      message: isValid ? 'Success! Schema JSON is valid and has been updated.' : 'Error! Invalid JSON format. Please correct and try again.',
      showMessage: true,
    });

    // If valid, update the hidden schema_markup field in the form
    if (!isValid) {
      setError('schema_data', {
        type: 'manual',
        message: 'Invalid JSON format. Please fix the syntax.',
      });
    }

    // Hide message after 3 seconds
    setTimeout(() => {
      setValidationState((prevState) => ({
        ...prevState,
        showMessage: false,
      }));
    }, 3000);
  };

  return (
    <Accordion
      type="single"
      collapsible
      value={openItem}
      onValueChange={(value) => {
        if (value) setOpenItem(value);
      }}
    >
      <AccordionItem value="item-1">
        <AccordionTrigger className="hover:bg-gray-50 px-4">
          <h2 className="text-black font-semibold text-xl">Basic Settings</h2>
        </AccordionTrigger>
        <AccordionContent className="px-2 space-y-4">
          <div className="space-y-2">
            <Label className={`${errors?.seo?.meta_title?.message && 'text-red-400'}`}>Meta Title</Label>
            <Input
              type="text"
              maxLength="60"
              placeholder="Enter meta title"
              className="focus-visible:ring-secondaryDark"
              {...register('seo.meta_title', {
                required: 'Meta Title Required',
              })}
            />
            <span className="block text-xs p-1 text-gray-500">{`${String(metaTitle || '').length}/60`} Characters</span>
            {errors?.seo?.meta_title && <p className="text-red-400 text-sm">{errors?.seo?.meta_title?.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className={`${errors?.seo?.meta_description?.message && 'text-red-400'}`}>Meta Description</Label>
            <Input
              type="text"
              placeholder="Enter meta description"
              maxLength="160"
              className="focus-visible:ring-secondaryDark"
              {...register('seo.meta_description', {
                required: 'Meta Description Required',
              })}
            />
            <span className="block text-xs p-1 text-gray-500">{`${String(metaDescription || '').length}/160`} Characters</span>
            {errors?.seo?.meta_description && <p className="text-red-400 text-sm">{errors?.seo?.meta_description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className={`${errors?.seo?.keywords?.message && 'text-red-400'}`}>Keywords</Label>
            <Input
              type="text"
              placeholder="Enter keywords separated by commas"
              className="focus-visible:ring-secondaryDark"
              {...register('seo.keywords', {
                required: 'Keywords Required',
                onBlur: (e) => {
                  const formatted = addCommabetweenString(e.target.value);
                  setValue('seo.keywords', formatted);
                },
              })}
            />
            {errors?.seo?.keywords && <p className="text-red-400 text-sm">{errors?.seo?.keywords?.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className={`${errors?.seo?.og_image_url?.message && 'text-red-400'}`}>OG Image Url</Label>
            <Input
              type="text"
              placeholder="Enter OG Image Url"
              className="focus-visible:ring-secondaryDark"
              {...register('seo.og_image_url', {
                required: 'og_image_url Required',
              })}
            />
            {errors?.seo?.og_image_url && <p className="text-red-400 text-sm">{errors?.seo?.og_image_url?.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className={`${errors?.seo?.canonical_url?.message && 'text-red-400'}`}>Canonical Url</Label>
            <Input
              type="text"
              placeholder="Enter canonical URL"
              className="focus-visible:ring-secondaryDark"
              {...register('seo.canonical_url', {
                required: 'canonical_url Required',
              })}
            />
            {errors?.seo?.canonical_url && <p className="text-red-400 text-sm">{errors?.seo?.canonical_url?.message}</p>}
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger className="hover:bg-gray-50 px-4">
          <h2 className="text-black font-semibold text-xl">Schema Markup</h2>
          {errors?.schema_data?.message && <div className="bg-red-100 text-red-800">{errors?.schema_data?.message}</div>}
        </AccordionTrigger>
        <AccordionContent className="px-2 flex flex-col">
          <Card className="p-8 space-y-4">
            <div>
              <Label>Select Schema Type</Label>
              <Controller
                control={control}
                name="seo.schema_type"
                defaultValue="Product"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
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

            <div>
              <Label>Edit JSON-LD</Label>
              <Textarea
                className={`font-mono text-sm h-96 resize-none ${validationState.showMessage ? (validationState.isValid ? 'border-green-500' : 'border-red-500') : ''}`}
                value={jsonInput}
                placeholder={selectedSchemaData ? JSON.stringify(selectedSchemaData, null, 2) : 'Schema data will appear here...'}
                onChange={(e) => setJsonInput(e.target.value)}
              />

              <input type="hidden" {...register('seo.schema_data')} />
            </div>

            <Button type="button" onClick={handleJsonUpdate}>
              Validate & Update Schema
            </Button>

            {validationState.showMessage && (
              <div className={`p-4 rounded-md text-sm ${validationState.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{validationState.message}</div>
            )}
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default SeoTab;
