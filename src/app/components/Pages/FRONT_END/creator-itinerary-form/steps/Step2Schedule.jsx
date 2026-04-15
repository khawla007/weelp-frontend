'use client';

import { useState } from 'react';
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import { isEmpty } from 'lodash';
import { Activity, Car, Clock, MapPin, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  ActivitySearchModal,
  CustomizedEditActivityForm,
  CustomizedEditTransferForm,
  TransferSearchModal,
} from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/itineraries/itinerary_shared';

export default function Step2Schedule({ alltransfers = [], onSubmit, submitLabel = 'Submit for Review', submitting = false }) {
  const [openDropdownForDay, setOpenDropdownForDay] = useState(null);
  const [modalContext, setModalContext] = useState({ type: '', day: null });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [handleEdit, setHandleEdit] = useState({
    type: '',
    isEditOn: false,
    item: {},
  });

  const {
    register,
    control,
    getValues,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext();

  // Schedules Repeater
  const {
    fields: dayFields,
    append: addDay,
    remove: removeDay,
  } = useFieldArray({
    control,
    name: 'schedules',
  });

  // Activity Repeater
  const {
    fields: activityFields,
    append: addActivity,
    update: updateActivity,
    remove: removeActivity,
  } = useFieldArray({
    control,
    name: 'activities',
  });

  // Transfer Repeater
  const {
    fields: transferFields,
    append: addTransfer,
    update: updateTransfer,
    remove: removeTransfer,
  } = useFieldArray({
    control,
    name: 'transfers',
  });

  // Local watch of schedules
  const schedules = useWatch({ control, name: 'schedules' });
  const activities = useWatch({ control, name: 'activities' });
  const transferss = useWatch({ control, name: 'transfers' });

  // Add Day with auto-incrementing value
  const handleAddDay = () => {
    const nextDay = dayFields.length + 1;
    addDay({ day: nextDay, title: '' });
  };

  // Validate and submit
  const handleValidationSchedule = (e) => {
    e.preventDefault();

    if (isEmpty(schedules)) {
      setError('schedules', {
        type: 'manual',
        message: 'At least one schedule is required',
      });
      return;
    }

    const hasItems = !isEmpty(activities) || !isEmpty(transferss);
    if (!hasItems) {
      setError('schedules', {
        type: 'manual',
        message: 'At least one activity or transfer is required',
      });
      return;
    }

    clearErrors('schedules');
    if (typeof onSubmit === 'function') {
      onSubmit();
    }
  };

  // Modal Handle
  const handleOpenModal = (type, day) => {
    setDropdownOpen(false);
    setTimeout(() => {
      setModalContext({ type, day });
    }, 50);
  };

  const handleCloseModal = () => {
    setModalContext({ type: '', day: '' });
  };

  const handleRemoveActivity = ({ activity_id }, day) => {
    setValue(
      'activities',
      activities.filter((a) => !(a.activity_id == activity_id && a.day == day)),
    );
  };

  const handleRemoveTransfer = ({ transfer_id }, day) => {
    setValue(
      'transfers',
      transferss.filter((t) => !(t?.transfer_id == transfer_id && t?.day == day)),
    );
  };

  return (
    <div className="py-4 relative">
      {errors?.schedules && <p className="text-sm text-red-500">{errors?.schedules?.message}</p>}

      <div className="w-full flex justify-between items-center">
        <h3 className="text-base font-semibold text-[#09090B]">Daily Schedule</h3>
        <Button type="button" onClick={handleAddDay} className="bg-secondaryDark hover:bg-secondaryDark">
          + Add Day
        </Button>
      </div>

      {/* Days Repeater */}
      {dayFields.map((item, index) => (
        <div key={item?.id} className="space-y-4">
          <div className="flex items-center gap-4 mt-4 justify-between">
            <Input type="number" {...register(`schedules.${index}.day`)} defaultValue={item?.day} className="w-20 focus-visible:ring-secondaryDark focus-visible:ring-1" placeholder="Day" readOnly />
            <Input type="text" {...register(`schedules.${index}.title`)} className="flex-1 focus-visible:ring-secondaryDark focus-visible:ring-1" placeholder="e.g., Arrival in Port Blair" />
            <Trash2 onClick={() => removeDay(index)} className="text-red-400 cursor-pointer" size={16} />
          </div>

          <div className="flex flex-col space-y-4">
            {/* Display Activities in Iteration */}
            {!isEmpty(activities) ? (
              activities
                .filter((activity) => activity?.day == item.day)
                .map((filteredActivity, activityIndex) => (
                  <div key={activityIndex} className="p-4 flex w-full border rounded-md items-center gap-4">
                    <img className="size-24" src={filteredActivity?.activitydata?.media_gallery?.[0]?.url ?? 'https://picsum.photos/100/100'} alt="random" />
                    <div className="space-y-2">
                      <p className="font-bold text-base">{filteredActivity?.activitydata?.name}</p>
                      <div className="flex gap-2 items-center">
                        <Clock /> {`${filteredActivity?.start_time} - ${filteredActivity?.end_time}`}
                        <Activity /> <b>Activity</b>
                        <Settings
                          size={16}
                          onClick={() =>
                            setHandleEdit({
                              type: 'activity',
                              isEditOn: true,
                              item: filteredActivity,
                            })
                          }
                        />
                        <Trash2 onClick={() => handleRemoveActivity(filteredActivity, item?.day)} className="text-red-400 cursor-pointer" size={16} />
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <p>No activities available for this day.</p>
            )}

            {/* Display Transfer in Iteration */}
            {!isEmpty(transferss) ? (
              transferss
                .filter((transfer) => transfer?.day == item.day)
                .map((filteredTransfer, transferIndex) => (
                  <div key={transferIndex} className="p-4 flex w-full border rounded-md items-center gap-4">
                    <img className="size-24" src={filteredTransfer?.transferData?.media_gallery?.[0]?.url ?? 'https://picsum.photos/100/100'} alt="transfer_image" />
                    <div className="space-y-2">
                      <p className="font-bold text-base">{filteredTransfer?.transferData?.name}</p>
                      <div className="flex gap-2 items-center">
                        <Clock /> {`${filteredTransfer?.start_time} - ${filteredTransfer?.end_time}`}
                        <Car />
                        <b>Transfer</b>
                        <Settings
                          size={16}
                          onClick={() =>
                            setHandleEdit({
                              type: 'transfer',
                              isEditOn: true,
                              item: filteredTransfer,
                            })
                          }
                        />
                        <Trash2 onClick={() => handleRemoveTransfer(filteredTransfer, item?.day)} className="text-red-400 cursor-pointer" size={16} />
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <p>No Transfer this day</p>
            )}

            {/* Booking Type */}
            <div className="w-full flex justify-center">
              <DropdownMenu
                open={openDropdownForDay == item.day}
                onOpenChange={(isOpen) => {
                  setOpenDropdownForDay(isOpen ? item.day : null);
                }}
              >
                <DropdownMenuTrigger>
                  <p className="bg-secondaryDark hover:bg-secondaryDark rounded-3xl p-2 text-white px-6 self-center">+ Add Item</p>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenDropdownForDay(null);
                      handleOpenModal('activity', item.day);
                    }}
                  >
                    <Car /> Add Activity
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenDropdownForDay(null);
                      handleOpenModal('transfer', item.day);
                    }}
                  >
                    <MapPin /> Add Transfer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Activity Search Modal */}
            {modalContext.type === 'activity' && modalContext.day == item.day && (
              <ActivitySearchModal
                cityIds={getValues('locations') || []}
                day={item?.day}
                addActivity={addActivity}
                onClose={handleCloseModal}
                apiPrefix="creator"
              />
            )}
            {/* Transfer Search Modal */}
            {modalContext.type === 'transfer' && modalContext.day === item.day && (
              <TransferSearchModal
                day={item?.day}
                onClose={handleCloseModal}
                addTransfer={addTransfer}
                transfers={(alltransfers || []).filter((t) => {
                  const selectedCityIds = getValues('locations') || [];
                  if (selectedCityIds.length === 0) return true;
                  const pickupCityId = t.vendor_routes?.pickup_city_id;
                  return pickupCityId && selectedCityIds.includes(pickupCityId);
                })}
              />
            )}
          </div>

          {/* Edit Form Modal */}
          {handleEdit?.isEditOn && handleEdit?.type === 'activity' && (
            <CustomizedEditActivityForm
              isEditOn={handleEdit.isEditOn}
              selectedActivity={handleEdit?.item}
              day={handleEdit?.item?.day}
              updateActivity={updateActivity}
              activities={activities}
              onClose={() => setHandleEdit({ type: '', isEditOn: false })}
            />
          )}

          {handleEdit?.isEditOn && handleEdit?.type === 'transfer' && (
            <CustomizedEditTransferForm
              isEditOn={handleEdit.isEditOn}
              selectedTransfer={handleEdit?.item}
              day={handleEdit?.item?.day}
              updateTransfer={updateTransfer}
              transfers={transferss}
              onClose={() => setHandleEdit({ type: '', isEditOn: false })}
            />
          )}
        </div>
      ))}

      {/* Submit Button */}
      <Button
        type="button"
        onClick={handleValidationSchedule}
        disabled={submitting}
        className={`absolute right-0 -bottom-14 ml-auto py-2 px-4 shadow-sm text-sm font-medium rounded-md text-white bg-secondaryDark cursor-pointer`}
      >
        {submitting ? 'Submitting...' : submitLabel}
      </Button>
    </div>
  );
}
