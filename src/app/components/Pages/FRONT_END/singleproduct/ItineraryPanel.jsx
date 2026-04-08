'use client';

import React, { useRef, useState, useEffect } from 'react';
import { MapPin, LifeBuoy, User, Wind, Clock4, Eye, Plus, Trash2, Pencil, X } from 'lucide-react';
import { useItineraryEditStore } from '@/lib/store/useItineraryEditStore';
import ActivitySearchModalPublic from './ActivitySearchModalPublic';
import TransferSearchModalPublic from './TransferSearchModalPublic';

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

const ItineraryPanel = ({ schedules = [], startDate = null, title = 'Itinerary', session = null, itinerary = null, readOnly = false }) => {
  const dayRefs = useRef({});
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // Determine if edit mode is active: itinerary is an original (no creator_id and no user_id)
  const isEditing = !readOnly && !!(itinerary && !itinerary.creator_id && !itinerary.user_id);

  // Initialize the edit store when in edit mode
  useEffect(() => {
    if (isEditing && itinerary) {
      useItineraryEditStore.getState().initializeEdit(itinerary);
    }
    return () => {
      useItineraryEditStore.getState().clearEdit();
    };
  }, [isEditing, itinerary]);

  // Read modified schedules from the store (only subscribes when editing)
  const modifiedSchedules = useItineraryEditStore((state) => (isEditing ? state.modifiedSchedules : null));

  // Use modified schedules when editing, otherwise use the prop
  const displaySchedules = isEditing && modifiedSchedules ? modifiedSchedules : schedules;

  const scrollToDay = (dayIndex) => {
    const el = dayRefs.current[dayIndex];
    if (el) {
      const offset = el.getBoundingClientRect().top + window.scrollY - 200;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  };

  // Update active day on scroll using Intersection Observer
  useEffect(() => {
    if (displaySchedules.length === 0) return;

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
  }, [displaySchedules.length]);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-[28px] font-semibold text-[#273f4e] capitalize">{title}</h2>

      {/* Date Navigation Buttons + Schedule Detail - inline layout */}
      {startDate && (displaySchedules.length > 0 || isEditing) && (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left: Date Navigation Buttons - vertical column on desktop */}
          <div className="flex md:flex-col gap-2 flex-shrink-0 md:w-fit overflow-x-auto pb-2 md:pb-0">
            {displaySchedules.map((_, index) => {
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

            {/* Add Day button - only when editing */}
            {isEditing && (
              <button
                onClick={() => useItineraryEditStore.getState().addDay()}
                className="px-[18px] py-3 text-base font-medium whitespace-nowrap rounded-[6px] transition-colors border border-dashed border-[#57947d] text-[#57947d] hover:bg-[#57947d]/5 flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add Day
              </button>
            )}
          </div>

          {/* Right: Day-by-Day Schedule */}
          <div className="flex flex-col gap-8 flex-1">
            {displaySchedules.map((schedule, index) => {
              const { day = '', activities = [], transfers = [] } = schedule;
              const dayTitle = schedule.title || `Day ${day}`;

              return (
                <div key={index} ref={(el) => (dayRefs.current[index] = el)}>
                  <ScheduleDayCard
                    dayNumber={day}
                    dayTitle={dayTitle}
                    activities={activities}
                    transfers={transfers}
                    startDate={startDate}
                    dayIndex={index}
                    isEditing={isEditing}
                    slug={itinerary?.slug}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const ScheduleDayCard = ({ dayNumber, dayTitle, activities, transfers, startDate, dayIndex, isEditing = false, slug = null }) => {
  // Modal state: null, { type: 'changeActivity', index }, { type: 'changeTransfer', index }, { type: 'addActivity' }, { type: 'addTransfer' }
  const [activeModal, setActiveModal] = useState(null);

  // Compute date label for this day
  let dateLabel = '';
  if (startDate) {
    const dayDate = new Date(startDate);
    dayDate.setDate(dayDate.getDate() + dayIndex);
    dateLabel = formatDayDate(dayDate);
  }

  const handleModalSelect = (item) => {
    if (!activeModal) return;
    const store = useItineraryEditStore.getState();

    switch (activeModal.type) {
      case 'changeActivity':
        store.changeActivity(dayIndex, activeModal.index, item);
        break;
      case 'addActivity':
        store.addActivity(dayIndex, item);
        break;
      case 'changeTransfer':
        store.changeTransfer(dayIndex, activeModal.index, item);
        break;
      case 'addTransfer':
        store.addTransfer(dayIndex, item);
        break;
    }
    setActiveModal(null);
  };

  const isActivityModal = activeModal?.type === 'changeActivity' || activeModal?.type === 'addActivity';
  const isTransferModal = activeModal?.type === 'changeTransfer' || activeModal?.type === 'addTransfer';

  return (
    <div className="flex flex-col gap-4">
      {/* Day Header */}
      <div className="flex items-center gap-3">
        <p className="text-[#0c2536] text-lg font-semibold whitespace-nowrap">Day - {dayNumber}</p>
        {isEditing ? (
          <input
            type="text"
            value={dayTitle === `Day ${dayNumber}` ? '' : dayTitle}
            onChange={(e) => useItineraryEditStore.getState().updateDayTitle(dayIndex, e.target.value)}
            placeholder={`Day ${dayNumber}`}
            className="text-[#0c2536] text-lg font-semibold bg-transparent border-b border-dashed border-[#ccc] focus:border-[#57947d] outline-none flex-1 min-w-0"
          />
        ) : (
          <span className="text-[#0c2536] text-lg font-semibold">{dayTitle}</span>
        )}
        {dateLabel && <span className="text-sm text-[#5a5a5a] whitespace-nowrap">({dateLabel})</span>}
        {isEditing && (
          <button onClick={() => useItineraryEditStore.getState().removeDay(dayIndex)} className="ml-auto text-red-400 hover:text-red-600 transition-colors p-1 flex-shrink-0" title="Remove Day">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Transfer Cards */}
      {transfers.map((transfer, transferIndex) => {
        const { name: transferName, pickup_location, dropoff_location, vehicle_type, duration: transferDuration } = transfer;
        if (!transferName) return null;

        return (
          <div key={transferIndex} className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-[#f8f9f9] border-b border-[#e5e5e5]">
              <span className="text-sm font-semibold text-[#0c2536]">Transfer</span>
              <div className="flex items-center gap-3">
                {isEditing && (
                  <>
                    <button
                      onClick={() => setActiveModal({ type: 'changeTransfer', index: transferIndex })}
                      className="inline-flex items-center gap-1.5 text-sm text-[#5a5a5a] hover:text-[#0c2536] transition-colors"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      onClick={() => useItineraryEditStore.getState().removeTransfer(dayIndex, transferIndex)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      title="Remove Transfer"
                    >
                      <X size={15} />
                    </button>
                  </>
                )}
                {!isEditing && <span className="text-sm text-[#5a5a5a]">Description</span>}
              </div>
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
        );
      })}

      {/* Activity Cards */}
      {activities.map((activity, activityIndex) => {
        const { name: activityName, place_name, main_location, duration_minutes, type: activityType, featured_image } = activity;
        const locationName = place_name || main_location;
        if (!activityName) return null;

        return (
          <div key={activityIndex} className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-[#f8f9f9] border-b border-[#e5e5e5]">
              <span className="text-sm font-semibold text-[#0c2536]">
                Activity in {locationName || 'Unknown'} {formatDuration(duration_minutes) || ''}
              </span>
              <div className="flex items-center gap-3">
                {isEditing && (
                  <>
                    <button
                      onClick={() => setActiveModal({ type: 'changeActivity', index: activityIndex })}
                      className="inline-flex items-center gap-1.5 text-sm text-[#5a5a5a] hover:text-[#0c2536] transition-colors"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      onClick={() => useItineraryEditStore.getState().removeActivity(dayIndex, activityIndex)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      title="Remove Activity"
                    >
                      <X size={15} />
                    </button>
                  </>
                )}
                {!isEditing && <span className="text-sm text-[#5a5a5a]">Description</span>}
              </div>
            </div>
            <div className="flex gap-4 p-4">
              <img src={featured_image || 'https://picsum.photos/300/200?random=2'} alt={activityName} className="w-[140px] h-[100px] object-cover rounded-lg flex-shrink-0" />
              <div className="flex flex-col justify-center gap-2 flex-1">
                <h3 className="text-[#0c2536] text-base font-semibold">{activityName}</h3>
                {locationName && <p className="text-sm text-[#5a5a5a]">{locationName}</p>}
                <div className="flex gap-4 flex-wrap mt-1">
                  {activity.tags?.map((tag, i) => (
                    <span key={i} className="text-[#5a5a5a] inline-flex gap-1.5 items-center text-sm">
                      <Eye size={14} /> {typeof tag === 'object' ? tag.name : tag}
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
          </div>
        );
      })}

      {/* Add Activity / Add Transfer buttons - only when editing */}
      {isEditing && (
        <div className="flex gap-3">
          <button
            onClick={() => setActiveModal({ type: 'addActivity' })}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#57947d] border border-dashed border-[#57947d] rounded-lg hover:bg-[#57947d]/5 transition-colors"
          >
            <Plus size={14} /> Add Activity
          </button>
          <button
            onClick={() => setActiveModal({ type: 'addTransfer' })}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#57947d] border border-dashed border-[#57947d] rounded-lg hover:bg-[#57947d]/5 transition-colors"
          >
            <Plus size={14} /> Add Transfer
          </button>
        </div>
      )}

      {/* Modals */}
      {isEditing && (
        <>
          <ActivitySearchModalPublic open={isActivityModal} onOpenChange={(open) => !open && setActiveModal(null)} slug={slug} onSelect={handleModalSelect} />
          <TransferSearchModalPublic open={isTransferModal} onOpenChange={(open) => !open && setActiveModal(null)} slug={slug} onSelect={handleModalSelect} />
        </>
      )}
    </div>
  );
};

export default ItineraryPanel;
