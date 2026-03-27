'use client';

import React, { useRef, useState, useEffect } from 'react';
import { MapPin, LifeBuoy, User, Wind, Clock4, Eye } from 'lucide-react';

// Format duration: show in minutes, convert to hours only if >= 60
const formatDuration = (minutes) => {
  if (!minutes) return null;
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours} Hr${hours > 1 ? 's' : ''}`;
  }
  return `${minutes} Mins`;
};

// Format date as "3rd Oct, Mon"
const formatDayDate = (date) => {
  const day = date.getDate();
  const suffix = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  return `${day}${suffix} ${month}, ${weekday}`;
};

const ItineraryPanel = ({ schedules = [], startDate = null, title = 'Itinerary' }) => {
  const dayRefs = useRef({});
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  const scrollToDay = (dayIndex) => {
    const el = dayRefs.current[dayIndex];
    if (el) {
      const offset = el.getBoundingClientRect().top + window.scrollY - 200;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  };

  // Update active day on scroll using Intersection Observer
  useEffect(() => {
    if (schedules.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.dataset.dayIndex);
            setActiveDayIndex(index);
          }
        });
      },
      { threshold: 0.5, rootMargin: '-100px 0px -50% 0px' },
    );

    Object.entries(dayRefs.current).forEach(([index, el]) => {
      if (el) {
        el.dataset.dayIndex = index;
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [schedules.length]);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-[28px] font-semibold text-[#273f4e] capitalize">{title}</h2>

      {/* Date Navigation Buttons + Schedule Detail - inline layout */}
      {startDate && schedules.length > 0 && (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left: Date Navigation Buttons - vertical column on desktop */}
          <div className="flex md:flex-col gap-2 flex-shrink-0 md:w-fit overflow-x-auto pb-2 md:pb-0">
            {schedules.map((_, index) => {
              const dayDate = new Date(startDate);
              dayDate.setDate(dayDate.getDate() + index);
              const isActive = activeDayIndex === index;

              return (
                <button
                  key={index}
                  onClick={() => scrollToDay(index)}
                  className={`
                    px-[18px] py-3 text-base font-medium whitespace-nowrap rounded-[6px] transition-colors
                    ${
                      isActive
                        ? 'bg-gradient-to-b from-[#f3f5f5] to-[#57947d]/10 border border-[#57947d] text-[#56756c]'
                        : 'bg-white border border-[#ccc]/50 text-[#667085] hover:border-[#57947d] hover:text-[#56756c]'
                    }
                  `}
                >
                  {formatDayDate(dayDate)}
                </button>
              );
            })}
          </div>

          {/* Right: Day-by-Day Schedule */}
          <div className="flex flex-col gap-8 flex-1">
            {schedules.map((schedule, index) => {
              const { day = '', activities = [], transfers = [] } = schedule;
              const dayTitle = schedule.title || 'Arrival in Port Blair';

              return (
                <div key={index} ref={(el) => (dayRefs.current[index] = el)}>
                  <ScheduleDayCard dayNumber={day} dayTitle={dayTitle} activities={activities} transfers={transfers} startDate={startDate} dayIndex={index} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const ScheduleDayCard = ({ dayNumber, dayTitle, activities, transfers, startDate, dayIndex }) => {
  const transfer = transfers?.[0] || {};
  const { name: transferName, pickup_location, dropoff_location, vehicle_type, duration: transferDuration } = transfer;
  const activity = activities?.[0] || {};
  const { name: activityName, main_location, duration_minutes, type: activityType, featured_image } = activity;

  // Compute date label for this day
  let dateLabel = '';
  if (startDate) {
    const dayDate = new Date(startDate);
    dayDate.setDate(dayDate.getDate() + dayIndex);
    dateLabel = formatDayDate(dayDate);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Day Header */}
      <div className="flex items-center gap-3">
        <p className="text-[#0c2536] text-lg font-semibold">
          Day - {dayNumber} {dayTitle}
        </p>
        {dateLabel && <span className="text-sm text-[#5a5a5a]">({dateLabel})</span>}
      </div>

      {/* Transfer Card */}
      {transferName && (
        <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-[#f8f9f9] border-b border-[#e5e5e5]">
            <span className="text-sm font-semibold text-[#0c2536]">Transfer</span>
            <span className="text-sm text-[#5a5a5a]">Description</span>
          </div>
          <div className="flex gap-4 p-4">
            <img src={transfer.featured_image || 'https://picsum.photos/300/200?random=1'} alt={transferName} className="w-[140px] h-[100px] object-cover rounded-lg flex-shrink-0" />
            <div className="flex flex-col justify-center gap-2 flex-1">
              <h3 className="text-[#0c2536] text-base font-semibold">{transferName}</h3>
              {vehicle_type && <p className="text-sm text-[#5a5a5a]">{vehicle_type}</p>}
              <div className="flex gap-4 flex-wrap mt-1">
                <span className="text-[#5a5a5a] inline-flex gap-1.5 items-center text-sm">
                  <User size={14} /> 3 Seater
                </span>
                <span className="text-[#5a5a5a] inline-flex gap-1.5 items-center text-sm">
                  <Wind size={14} /> AC
                </span>
                <span className="text-[#5a5a5a] inline-flex gap-1.5 items-center text-sm">
                  <LifeBuoy size={14} /> First Aid
                </span>
              </div>
            </div>
          </div>

          {/* Pickup to Dropoff */}
          <div className="px-4 pb-4 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 border border-[#e5e5e5] rounded-lg py-2 px-4 text-sm text-[#0c2536]">
              <MapPin size={14} /> {pickup_location || 'Airport'}
            </span>
            <div className="flex items-center gap-2 flex-1 mx-2">
              <div className="flex-1 border-t border-dashed border-[#ccc]" />
              {transferDuration && <span className="text-xs text-[#5a5a5a] whitespace-nowrap">{transferDuration}</span>}
              <div className="flex-1 border-t border-dashed border-[#ccc]" />
            </div>
            <span className="inline-flex items-center gap-2 border border-[#e5e5e5] rounded-lg py-2 px-4 text-sm text-[#0c2536]">
              <MapPin size={14} /> {dropoff_location || 'Hotel'}
            </span>
          </div>
        </div>
      )}

      {/* Activity Card */}
      {activityName && (
        <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-[#f8f9f9] border-b border-[#e5e5e5]">
            <span className="text-sm font-semibold text-[#0c2536]">
              Activity in {main_location || 'Unknown'} {formatDuration(duration_minutes) || ''}
            </span>
            <span className="text-sm text-[#5a5a5a]">Description</span>
          </div>
          <div className="flex gap-4 p-4">
            <img src={featured_image || 'https://picsum.photos/300/200?random=2'} alt={activityName} className="w-[140px] h-[100px] object-cover rounded-lg flex-shrink-0" />
            <div className="flex flex-col justify-center gap-2 flex-1">
              <h3 className="text-[#0c2536] text-base font-semibold">{activityName}</h3>
              {main_location && <p className="text-sm text-[#5a5a5a]">{main_location}</p>}
              <div className="flex gap-4 flex-wrap mt-1">
                {activity.tags?.map((tag, i) => (
                  <span key={i} className="text-[#5a5a5a] inline-flex gap-1.5 items-center text-sm">
                    <Eye size={14} /> {tag}
                  </span>
                ))}
                {duration_minutes && (
                  <span className="text-[#5a5a5a] inline-flex gap-1.5 items-center text-sm">
                    <Clock4 size={14} /> {formatDuration(duration_minutes)}
                  </span>
                )}
                {activityType && (
                  <span className="text-[#5a5a5a] inline-flex gap-1.5 items-center text-sm">
                    <Eye size={14} /> {activityType}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Activity Locations: Hotel → City Name */}
          {main_location && (
            <div className="px-4 pb-4 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 border border-[#e5e5e5] rounded-lg py-2 px-4 text-sm text-[#0c2536]">
                <MapPin size={14} /> Hotel
              </span>
              <div className="flex items-center gap-2 flex-1 mx-2">
                <div className="flex-1 border-t border-dashed border-[#ccc]" />
                {duration_minutes && <span className="text-xs text-[#5a5a5a] whitespace-nowrap">{formatDuration(duration_minutes)}</span>}
                <div className="flex-1 border-t border-dashed border-[#ccc]" />
              </div>
              <span className="inline-flex items-center gap-2 border border-[#e5e5e5] rounded-lg py-2 px-4 text-sm text-[#0c2536]">
                <MapPin size={14} /> {main_location}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ItineraryPanel;
