'use client';

import { Controller } from 'react-hook-form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Star, Tag } from 'lucide-react';
import ReactRangeSliderInput from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import { DashboardSearch } from './DashboardSearch';

const seasons = ['Spring', 'Summer', 'Autumn', 'Winter'];

export function ListingFilterSidebar({ control, filters, categories = [], difficulties = [], durations = [], searchPlaceholder = 'Search' }) {
  return (
    <div className="lg:w-1/4 space-y-6 p-4">
      {/* Search */}
      <div className="space-y-2">
        <DashboardSearch control={control} name="name" placeholder={searchPlaceholder} />
      </div>

      <Accordion type="single" collapsible>
        {/* Category */}
        {categories.length > 0 && (
          <AccordionItem value="category">
            <AccordionTrigger>
              <p className="flex items-center gap-4">
                <Tag size={18} /> Categories
              </p>
            </AccordionTrigger>
            <AccordionContent>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(val) => field.onChange(val === 'all' ? '' : val)}>
                    <SelectTrigger className="focus:ring-0">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category, i) => (
                          <SelectItem key={i} value={category.slug}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Difficulty */}
        {difficulties.length > 0 && (
          <AccordionItem value="difficulty_level">
            <AccordionTrigger>
              <p className="flex items-center gap-4">
                <Star size={18} /> Difficulty
              </p>
            </AccordionTrigger>
            <AccordionContent>
              <Controller
                name="difficulty_level"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(val) => field.onChange(val === 'all' ? '' : val)}>
                    <SelectTrigger className="focus:ring-0">
                      <SelectValue placeholder="All Difficulty Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">All Difficulty Levels</SelectItem>
                        {difficulties.map((level, i) => (
                          <SelectItem key={i} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Duration */}
        {durations.length > 0 && (
          <AccordionItem value="duration">
            <AccordionTrigger>
              <p className="flex items-center gap-4">
                <Clock size={18} /> Duration
              </p>
            </AccordionTrigger>
            <AccordionContent>
              <Controller
                name="duration"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(val) => field.onChange(val === 'all' ? '' : val)}>
                    <SelectTrigger className="focus:ring-0">
                      <SelectValue placeholder="All Durations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">All Durations</SelectItem>
                        {durations.map((d, i) => (
                          <SelectItem key={i} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Seasons */}
        <AccordionItem value="seasons">
          <AccordionTrigger>
            <p className="flex items-center gap-4">
              <Calendar size={18} /> Seasons
            </p>
          </AccordionTrigger>
          <AccordionContent>
            <Controller
              name="season"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={(val) => field.onChange(val === 'all' ? '' : val)}>
                  <SelectTrigger className="focus:ring-0">
                    <SelectValue placeholder="All Seasons" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All Seasons</SelectItem>
                      {seasons.map((season, i) => (
                        <SelectItem key={i} value={season}>
                          {season}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Price Range */}
        <AccordionItem value="price">
          <AccordionTrigger>
            <p className="flex items-center gap-4">
              <Tag size={18} /> Price
            </p>
          </AccordionTrigger>
          <AccordionContent>
            <div className="py-4">
              <Controller
                name="price"
                control={control}
                render={({ field }) => <ReactRangeSliderInput {...field} min={50} max={2000} step={100} value={field.value} onInput={field.onChange} className="w-full" />}
              />

              <div className="w-full flex justify-between text-sm text-gray-600 mt-2">
                <span>${filters?.price?.[0]}</span>
                <span>${filters?.price?.[1]}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
