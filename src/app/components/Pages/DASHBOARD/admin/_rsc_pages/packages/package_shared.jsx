// File Handle Shard Component Regarding Itineraries
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { getAllActivitesAdmin } from '@/lib/services/activites';
import { log } from '@/lib/utils';
import { isEmpty } from 'lodash';
import { SearchIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export const NavigationPackage = ({ title, desciption }) => {
  if (title && desciption) {
    return (
      <div className="flex justify-between w-full py-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{desciption}</p>
        </div>
      </div>
    );
  }
  return <div className="flex justify-between w-full py-4 font-extrabold"> Props Not Passed </div>;
};

export const ActivitySearchModal = ({ day, onClose, activities = [], addActivity }) => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [modalOpen, setModalOpen] = useState(false); // for

  const [timing, setTiming] = useState({
    start_time: '',
    end_time: '',
    notes: '',
    price: '',
    included: true,
  });

  const handleSelectActivity = (activity) => {
    setSelectedActivity(activity);
    setModalOpen(true);
  };

  // close modal
  const closeModal = () => {
    setModalOpen(false);
    setSelectedActivity(null);
  };

  // Handle Timing
  const handleAddActivity = () => {
    if (selectedActivity && timing.start_time && timing.end_time) {
      addActivity({
        day,
        activity_id: selectedActivity?.id,
        activitydata: selectedActivity,
        ...timing,
      });
      closeModal();
    } else {
      alert('Please provide both start and end times.');
    }
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setTiming((prevTiming) => ({
      ...prevTiming,
      [name]: value,
    }));
  };

  const handleSearch = () => {};

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        {/* Your activity search form here */}
        <div className={`${!modalOpen ? 'block' : 'hidden'} space-y-4`}>
          <DialogHeader>
            <DialogTitle>Search Activity</DialogTitle>
            <DialogDescription className="sr-only">Search and add an activity to your schedule.</DialogDescription>
            Day is {day}
          </DialogHeader>

          <div className="w-full flex gap-4 items-center">
            <Input type="text" placeholder="Search Activity..." className="w-full border p-2 focus-visible:ring-secondaryDark focus-visible:ring-1" onChange={handleSearch} />
            <Button className="bg-white hover:bg-white border">
              <SearchIcon className="text-black" />
            </Button>
          </div>
          <ul>
            {activities.length > 0
              ? activities.map((activity, index) => {
                  return (
                    <li className="list-none hover:bg-neutral-100 cursor-pointer p-2" onClick={() => handleSelectActivity(activity)} key={activity?.id}>
                      {activity?.name}
                    </li>
                  );
                })
              : ''}
          </ul>
        </div>

        {/* SelectedItem */}
        {modalOpen && selectedActivity && (
          <div className="modal">
            <div className="modal-content">
              <h2>
                Customize Activity: {selectedActivity.name} and day is {day}{' '}
              </h2>

              {/* Timing Inputs */}
              <div className="space-y-4">
                <Separator className="mb-8" />
                <div className="flex w-full gap-4">
                  <Label htmlFor="start_time" className="flex flex-col w-full space-y-4 ">
                    <span>Start Time</span>
                    <Input
                      id="start_time"
                      name="start_time" // Name is used to dynamically update the state
                      type="time"
                      value={timing.start_time}
                      onChange={handleTimeChange}
                      className="p-2 border"
                    />
                  </Label>

                  <Label htmlFor="end_time" className="flex flex-col w-full space-y-4 ">
                    <span>End Time</span>
                    <Input
                      id="end_time"
                      name="end_time" // Name is used to dynamically update the state
                      type="time"
                      value={timing.end_time}
                      onChange={handleTimeChange}
                      className="p-2 border"
                    />
                  </Label>
                </div>
                <Label htmlFor="notes" className="flex flex-col w-full space-y-4 ">
                  <span>Notes</span>
                  <Textarea id="notes" name="notes" value={timing.notes} onChange={handleTimeChange} className="p-2 border " />
                </Label>

                <div className="flex w-full gap-4">
                  <Label htmlFor="price" className="flex flex-col w-full space-y-4 flex-[3] ">
                    <span>Price</span>
                    <Input id="price" name="price" type="number" min="1" value={timing.price} onChange={handleTimeChange} className="p-2 border" />
                  </Label>

                  <Label htmlFor="included" className="flex flex-col w-full space-y-4 flex-1">
                    <span className="text-nowrap">Include in Package</span>
                    <Switch
                      id="included"
                      name="included" // Name is used to dynamically update the state
                      checked={timing?.included}
                      onCheckedChange={(checked) =>
                        setTiming((prevTiming) => ({
                          ...prevTiming,
                          included: checked,
                        }))
                      }
                      className="data-[state=checked]:bg-secondaryDark ease-in-out duration-500"
                    />
                  </Label>
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-4">
                <Button onClick={handleAddActivity} className="p-2 rounded-md w-full">
                  Done
                </Button>
                {/* <Button onClick={closeModal} className="bg-red-500 text-white p-2 rounded-md">
                  Close
                </Button> */}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export const TransferSearchModal = ({ day, onClose, transfers = [], addTransfer }) => {
  const [selectedTransfer, setSelectedTransfer] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [timing, setTiming] = useState({
    start_time: '',
    end_time: '',
    notes: '',
    price: '',
    included: true,
    pickup_location: '',
    dropoff_location: '',
  });

  /** close modal handle  */
  const closeModal = () => {
    setModalOpen(false);
    setSelectedTransfer({});
  };

  /** selected transfer */
  const handleSelectTransfer = (transfer) => {
    setSelectedTransfer(transfer);
  };

  /** Handle Timing */
  const handleAddTransfer = () => {
    if (selectedTransfer && timing.start_time && timing.end_time) {
      addTransfer({
        day,
        transfer_id: selectedTransfer?.id,
        transferData: selectedTransfer,
        ...timing,
      });
      closeModal();
    } else {
      alert('Please provide both start and end times.');
    }
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setTiming((prevTiming) => ({
      ...prevTiming,
      [name]: value,
    }));
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <div className={`${!modalOpen && isEmpty(selectedTransfer) ? 'block' : 'hidden'} space-y-4`}>
          <DialogHeader>
            <DialogTitle>Search Transfer</DialogTitle>
            <DialogDescription className="sr-only">Search and add an Transfer to your schedule.</DialogDescription>
          </DialogHeader>

          {/* Your activity search form here */}
          <div className="w-full flex gap-4 items-center">
            <Input type="text" placeholder="Search transfers..." className="w-full border p-2 focus-visible:ring-secondaryDark focus-visible:ring-1" />
            <Button className="bg-white hover:bg-white border">
              <SearchIcon className="text-black" />
            </Button>
          </div>

          {/* Transfers Items */}
          {transfers.length > 0
            ? transfers.map((transfer, val) => {
                return (
                  <li className="list-none hover:bg-neutral-100 cursor-pointer p-2" onClick={() => handleSelectTransfer(transfer)} key={transfer?.id}>
                    {transfer?.name}
                  </li>
                );
              })
            : ''}
        </div>

        {!isEmpty(selectedTransfer) && (
          <div className="modal">
            <div className="modal-content">
              <h2>
                Customize Transfer: {selectedTransfer?.name} and day is {day}{' '}
              </h2>

              {/* Timing Inputs */}
              <div className="space-y-4">
                <Separator className="mb-8" />
                <div className="flex w-full gap-4">
                  <Label htmlFor="start_time" className="flex flex-col w-full space-y-4 ">
                    <span>Start Time</span>
                    <Input
                      id="start_time"
                      name="start_time" // Name is used to dynamically update the state
                      type="time"
                      value={timing.start_time}
                      onChange={handleTimeChange}
                      className="p-2 border"
                    />
                  </Label>

                  <Label htmlFor="end_time" className="flex flex-col w-full space-y-4 ">
                    <span>End Time</span>
                    <Input
                      id="end_time"
                      name="end_time" // Name is used to dynamically update the state
                      type="time"
                      value={timing.end_time}
                      onChange={handleTimeChange}
                      className="p-2 border"
                    />
                  </Label>
                </div>
                <Label htmlFor="notes" className="flex flex-col w-full space-y-4 ">
                  <span>Notes</span>
                  <Textarea id="notes" name="notes" value={timing.notes} onChange={handleTimeChange} className="p-2 border " />
                </Label>

                <div className="flex w-full gap-4">
                  <Label htmlFor="price" className="flex flex-col w-full space-y-4 flex-[3] ">
                    <span>Price</span>
                    <Input id="price" name="price" type="number" min="1" value={timing.price} onChange={handleTimeChange} className="p-2 border" />
                  </Label>

                  <Label htmlFor="included" className="flex flex-col w-full space-y-4 flex-1">
                    <span className="text-nowrap">Include in Package</span>
                    <Switch
                      id="included"
                      name="included" // Name is used to dynamically update the state
                      checked={timing?.included}
                      onCheckedChange={(checked) =>
                        setTiming((prevTiming) => ({
                          ...prevTiming,
                          included: checked,
                        }))
                      }
                      className="data-[state=checked]:bg-secondaryDark ease-in-out duration-500"
                    />
                  </Label>
                </div>

                <Label htmlFor="pickup_location" className="flex flex-col w-full space-y-4 ">
                  <span>Pickup Location</span>
                  <Input id="pickup_location" name="pickup_location" value={timing.pickup_location} onChange={handleTimeChange} className="p-2 border" />
                </Label>

                <Label htmlFor="dropoff_location" className="flex flex-col w-full space-y-4 ">
                  <span>DropOff Location</span>
                  <Input id="dropoff_location" name="dropoff_location" value={timing.dropoff_location} onChange={handleTimeChange} className="p-2 border" />
                </Label>

                <Label htmlFor="pax" className="flex flex-col w-full space-y-4 ">
                  <span>Pax</span>
                  <Input id="pax" name="pax" value={timing.pax || ''} onChange={handleTimeChange} className="p-2 border" />
                </Label>
              </div>

              <div className="flex flex-col gap-4 mt-4">
                <Button onClick={handleAddTransfer} className="p-2 rounded-md w-full bg-secondaryDark">
                  Done
                </Button>
                {/* <Button onClick={closeModal} className="bg-red-500 text-white p-2 rounded-md">
                  Close
                </Button> */}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export const ItinerarySearchModal = ({ day, onClose, itineraries = [], addItinerary }) => {
  const [selectedItinerary, setSelectedItinerary] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [timing, setTiming] = useState({
    start_time: '',
    end_time: '',
    notes: '',
    price: '',
    included: true,
  });

  /** close modal handle  */
  const closeModal = () => {
    setModalOpen(false);
    setSelectedItinerary({});
  };

  /** selected transfer */
  const handleSelectItinerary = (itinerary) => {
    setSelectedItinerary(itinerary);
  };

  /** Handle Timing */
  const handleAddItinerary = () => {
    if (selectedItinerary && timing.start_time && timing.end_time) {
      addItinerary({
        day,
        itinerary_id: selectedItinerary?.id,
        itineraryData: selectedItinerary,
        ...timing,
      });
      closeModal();
    } else {
      alert('Please provide both start and end times.');
    }
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setTiming((prevTiming) => ({
      ...prevTiming,
      [name]: value,
    }));
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <div className={`${!modalOpen && isEmpty(selectedItinerary) ? 'block' : 'hidden'} space-y-4`}>
          <DialogHeader>
            <DialogTitle>Search Itinerary</DialogTitle>
            <DialogDescription className="sr-only">Search and add an Transfer to your schedule.</DialogDescription>
          </DialogHeader>

          {/* Your activity search form here */}
          <div className="w-full flex gap-4 items-center">
            <Input type="text" placeholder="Search itineraries..." className="w-full border p-2 focus-visible:ring-secondaryDark focus-visible:ring-1" />
            <Button className="bg-white hover:bg-white border">
              <SearchIcon className="text-black" />
            </Button>
          </div>

          {/* itineraries Items */}
          {itineraries.length > 0
            ? itineraries.map((itinerary, val) => {
                return (
                  <li className="list-none hover:bg-neutral-100 cursor-pointer p-2" onClick={() => handleSelectItinerary(itinerary)} key={itinerary?.id}>
                    {itinerary?.name}
                  </li>
                );
              })
            : ''}
        </div>

        {!isEmpty(selectedItinerary) && (
          <div className="modal">
            <div className="modal-content">
              <h2>
                Customize Transfer: {selectedItinerary?.name} and day is {day}{' '}
              </h2>

              {/* Timing Inputs */}
              <div className="space-y-4">
                <Separator className="mb-8" />
                <div className="flex w-full gap-4">
                  <Label htmlFor="start_time" className="flex flex-col w-full space-y-4 ">
                    <span>Start Time</span>
                    <Input
                      id="start_time"
                      name="start_time" // Name is used to dynamically update the state
                      type="time"
                      value={timing.start_time}
                      onChange={handleTimeChange}
                      className="p-2 border"
                    />
                  </Label>

                  <Label htmlFor="end_time" className="flex flex-col w-full space-y-4 ">
                    <span>End Time</span>
                    <Input
                      id="end_time"
                      name="end_time" // Name is used to dynamically update the state
                      type="time"
                      value={timing.end_time}
                      onChange={handleTimeChange}
                      className="p-2 border"
                    />
                  </Label>
                </div>
                <Label htmlFor="notes" className="flex flex-col w-full space-y-4 ">
                  <span>Notes</span>
                  <Textarea id="notes" name="notes" value={timing.notes} onChange={handleTimeChange} className="p-2 border " />
                </Label>

                <div className="flex w-full gap-4">
                  <Label htmlFor="price" className="flex flex-col w-full space-y-4 flex-[3] ">
                    <span>Price</span>
                    <Input id="price" name="price" type="number" min="1" value={timing.price} onChange={handleTimeChange} className="p-2 border" />
                  </Label>

                  <Label htmlFor="included" className="flex flex-col w-full space-y-4 flex-1">
                    <span className="text-nowrap">Include in Package</span>
                    <Switch
                      id="included"
                      name="included" // Name is used to dynamically update the state
                      checked={timing?.included}
                      onCheckedChange={(checked) =>
                        setTiming((prevTiming) => ({
                          ...prevTiming,
                          included: checked,
                        }))
                      }
                      className="data-[state=checked]:bg-secondaryDark ease-in-out duration-500"
                    />
                  </Label>
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-4">
                <Button onClick={handleAddItinerary} className="p-2 rounded-md w-full bg-secondaryDark">
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

/** Edit Form Activity Schedules  */
export const CustomizedEditActivityForm = ({ isEditOn, updateActivity, day, selectedActivity, onClose, activities }) => {
  const [timing, setTiming] = useState({
    start_time: selectedActivity?.start_time ?? '',
    end_time: selectedActivity?.end_time ?? '',
    notes: selectedActivity?.notes ?? '',
    price: selectedActivity?.price ?? '',
    included: selectedActivity?.included ?? false,
  });

  /** handle for input timing change  */
  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setTiming((prevTiming) => ({
      ...prevTiming,
      [name]: value,
    }));
  };

  /**  Updating Activity */
  const handleUpdateActivity = () => {
    if (selectedActivity && timing.start_time && timing.end_time) {
      const activityIndex = activities.findIndex((activity) => activity.activity_id === selectedActivity.activity_id && activity.day === selectedActivity.day);

      if (activityIndex !== -1) {
        const updatedActivities = [...activities];
        updatedActivities[activityIndex] = {
          ...updatedActivities[activityIndex],
          activitydata: selectedActivity.activitydata,
          start_time: timing.start_time,
          end_time: timing.end_time,
          notes: timing.notes,
          price: timing.price,
          included: timing.included,
        };

        updateActivity(updatedActivities); // Assuming you're using useState
      } else {
        alert('Activity not found for the selected day.');
      }
    } else {
      alert('Please provide both start and end times.');
    }
  };

  return (
    <Dialog
      open={isEditOn}
      onOpenChange={(open) => {
        if (!open) onClose(); // Only close if user intended to close
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Customize Activity</DialogTitle>
          <DialogDescription className="sr-only">Make changes to your profile here. Click save when you&apos;re done.</DialogDescription>
        </DialogHeader>

        <div className="modal">
          <div className="modal-content">
            <h2>
              Customize Activity: {selectedActivity?.name} and day is {day}{' '}
            </h2>

            {/* Timing Inputs */}
            <div className="space-y-4">
              <Separator className="mb-8" />
              <div className="flex w-full gap-4">
                <Label htmlFor="start_time" className="flex flex-col w-full space-y-4 ">
                  <span>Start Time</span>
                  <Input
                    id="start_time"
                    name="start_time" // Name is used to dynamically update the state
                    type="time"
                    value={timing.start_time}
                    onChange={handleTimeChange}
                    className="p-2 border"
                  />
                </Label>

                <Label htmlFor="end_time" className="flex flex-col w-full space-y-4 ">
                  <span>End Time</span>
                  <Input
                    id="end_time"
                    name="end_time" // Name is used to dynamically update the state
                    type="time"
                    value={timing.end_time}
                    onChange={handleTimeChange}
                    className="p-2 border"
                  />
                </Label>
              </div>
              <Label htmlFor="notes" className="flex flex-col w-full space-y-4 ">
                <span>Notes</span>
                <Textarea id="notes" name="notes" value={timing.notes} onChange={handleTimeChange} className="p-2 border " />
              </Label>

              <div className="flex w-full gap-4">
                <Label htmlFor="price" className="flex flex-col w-full space-y-4 flex-[3] ">
                  <span>Price</span>
                  <Input id="price" name="price" type="number" min="1" value={timing.price} onChange={handleTimeChange} className="p-2 border" />
                </Label>

                <Label htmlFor="included" className="flex flex-col w-full space-y-4 flex-1">
                  <span className="text-nowrap">Include in Package</span>
                  <Switch
                    id="included"
                    name="included" // Name is used to dynamically update the state
                    checked={timing?.included}
                    onCheckedChange={(checked) =>
                      setTiming((prevTiming) => ({
                        ...prevTiming,
                        included: checked,
                      }))
                    }
                    className="data-[state=checked]:bg-secondaryDark ease-in-out duration-500"
                  />
                </Label>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-4">
              <Button onClick={handleUpdateActivity} className="p-2 rounded-md w-full bg-secondaryDark ">
                Submit
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/** Edit Form Transfer Schedules  */
export const CustomizedEditTransferForm = ({ isEditOn, updateTransfer, day, selectedTransfer, onClose, transfers }) => {
  const [timing, setTiming] = useState({
    start_time: selectedTransfer?.start_time ?? '',
    end_time: selectedTransfer?.end_time ?? '',
    notes: selectedTransfer?.notes ?? '',
    price: selectedTransfer?.price ?? '',
    included: selectedTransfer.included ?? false,
    pickup_location: selectedTransfer?.pickup_location ?? '',
    dropoff_location: selectedTransfer?.dropoff_location ?? '',
    pax: selectedTransfer?.pax ?? '',
  });

  /** handle for input timing change */
  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setTiming((prevTiming) => ({
      ...prevTiming,
      [name]: value,
    }));
  };

  /**  Adding New Activity */
  const handleUpdateTransfer = () => {
    if (selectedTransfer && timing.start_time && timing.end_time) {
      const transferIndex = transfers.findIndex((transfer) => transfer?.transfer_id == selectedTransfer?.transfer_id && transfer?.day == selectedTransfer?.day);

      if (transferIndex !== -1) {
        const updatedTransfer = {
          ...transfers[transferIndex],
          transferData: selectedTransfer?.transferData,
          start_time: timing.start_time,
          end_time: timing.end_time,
          notes: timing?.notes,
          price: timing?.price,
          included: timing?.included,
          pickup_location: timing?.pickup_location,
          dropoff_location: timing?.dropoff_location,
        };

        updateTransfer(transferIndex, updatedTransfer);
      } else {
        alert('Transfer not found for the selected day.');
      }
    } else {
      alert('Please provide both start and end times.');
    }
  };

  return (
    <Dialog
      open={isEditOn}
      onOpenChange={(open) => {
        if (!open) onClose(); // Only close if user intended to close
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Customize Transfer</DialogTitle>
          <DialogDescription className="sr-only">Click save when you&apos;re done.</DialogDescription>
        </DialogHeader>
        <div className="modal">
          <div className="modal-content">
            {/* Timing Inputs */}
            <div className="space-y-4">
              <Separator className="mb-8" />
              <div className="flex w-full gap-4">
                <Label htmlFor="start_time" className="flex flex-col w-full space-y-4 ">
                  <span>Start Time</span>
                  <Input
                    id="start_time"
                    name="start_time" // Name is used to dynamically update the state
                    type="time"
                    value={timing.start_time}
                    onChange={handleTimeChange}
                    className="p-2 border"
                  />
                </Label>

                <Label htmlFor="end_time" className="flex flex-col w-full space-y-4 ">
                  <span>End Time</span>
                  <Input
                    id="end_time"
                    name="end_time" // Name is used to dynamically update the state
                    type="time"
                    value={timing.end_time}
                    onChange={handleTimeChange}
                    className="p-2 border"
                  />
                </Label>
              </div>
              <Label htmlFor="notes" className="flex flex-col w-full space-y-4 ">
                <span>Notes</span>
                <Textarea id="notes" name="notes" value={timing.notes} onChange={handleTimeChange} className="p-2 border " />
              </Label>

              <div className="flex w-full gap-4">
                <Label htmlFor="price" className="flex flex-col w-full space-y-4 flex-[3] ">
                  <span>Price</span>
                  <Input id="price" name="price" type="number" min="1" value={timing.price} onChange={handleTimeChange} className="p-2 border" />
                </Label>

                <Label htmlFor="included" className="flex flex-col w-full space-y-4 flex-1">
                  <span className="text-nowrap">Include in Package</span>
                  <Switch
                    id="included"
                    name="included" // Name is used to dynamically update the state
                    checked={timing?.included}
                    onCheckedChange={(checked) =>
                      setTiming((prevTiming) => ({
                        ...prevTiming,
                        included: checked,
                      }))
                    }
                    className="data-[state=checked]:bg-secondaryDark ease-in-out duration-500"
                  />
                </Label>
              </div>

              <Label htmlFor="pickup_location" className="flex flex-col w-full space-y-4 ">
                <span>Pickup Location</span>
                <Input id="pickup_location" name="pickup_location" value={timing.pickup_location} onChange={handleTimeChange} className="p-2 border" />
              </Label>

              <Label htmlFor="dropoff_location" className="flex flex-col w-full space-y-4 ">
                <span>DropOff Location</span>
                <Input id="dropoff_location" name="dropoff_location" value={timing.dropoff_location} onChange={handleTimeChange} className="p-2 border" />
              </Label>

              <Label htmlFor="pax" className="flex flex-col w-full space-y-4 ">
                <span>Pax</span>
                <Input id="pax" name="pax" value={timing.pax || ''} onChange={handleTimeChange} className="p-2 border" />
              </Label>
            </div>

            <div className="flex flex-col gap-4 mt-4">
              <Button onClick={handleUpdateTransfer} className="p-2 rounded-md w-full bg-secondaryDark">
                Submit
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/** Edit Form Itinerary Schedules  */
export const CustomizedEditItineraryForm = ({ isEditOn, updateItinerary, day, selectedItinerary, onClose, itineraries }) => {
  const [timing, setTiming] = useState({
    start_time: selectedItinerary?.start_time ?? '',
    end_time: selectedItinerary?.end_time ?? '',
    notes: selectedItinerary?.notes ?? '',
    price: selectedItinerary?.price ?? '',
    included: selectedItinerary.included ?? false,
  });

  /** handle for input timing change */
  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setTiming((prevTiming) => ({
      ...prevTiming,
      [name]: value,
    }));
  };

  /**  Adding New Activity */
  const handleUpdateItinerary = () => {
    if (selectedItinerary && timing.start_time && timing.end_time) {
      const itineraryIndex = itineraries.findIndex((itinerary) => itinerary?.itinerary_id === selectedItinerary?.itinerary_id && itinerary?.day === selectedItinerary?.day);

      if (itineraryIndex !== -1) {
        const updatedItinerary = {
          ...itineraries[itineraryIndex],
          itineraryData: selectedItinerary?.itineraryData, // maybe rename this to itineraryData for clarity
          start_time: timing.start_time,
          end_time: timing.end_time,
          notes: timing?.notes,
          price: timing?.price,
          included: timing?.included,
          pickup_location: timing?.pickup_location,
          dropoff_location: timing?.dropoff_location,
        };

        updateItinerary(itineraryIndex, updatedItinerary);
      } else {
        alert('Itinerary not found for the selected day.');
      }
    } else {
      alert('Please provide both start and end times.');
    }
  };

  return (
    <Dialog
      open={isEditOn}
      onOpenChange={(open) => {
        if (!open) onClose(); // Only close if user intended to close
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Customize Itinerary</DialogTitle>
          <DialogDescription className="sr-only">Click save when you&apos;re done.</DialogDescription>
        </DialogHeader>
        <div className="modal">
          <div className="modal-content">
            {/* Timing Inputs */}
            <div className="space-y-4">
              <Separator className="mb-8" />
              <div className="flex w-full gap-4">
                <Label htmlFor="start_time" className="flex flex-col w-full space-y-4 ">
                  <span>Start Time</span>
                  <Input
                    id="start_time"
                    name="start_time" // Name is used to dynamically update the state
                    type="time"
                    value={timing.start_time}
                    onChange={handleTimeChange}
                    className="p-2 border"
                  />
                </Label>

                <Label htmlFor="end_time" className="flex flex-col w-full space-y-4 ">
                  <span>End Time</span>
                  <Input
                    id="end_time"
                    name="end_time" // Name is used to dynamically update the state
                    type="time"
                    value={timing.end_time}
                    onChange={handleTimeChange}
                    className="p-2 border"
                  />
                </Label>
              </div>
              <Label htmlFor="notes" className="flex flex-col w-full space-y-4 ">
                <span>Notes</span>
                <Textarea id="notes" name="notes" value={timing.notes} onChange={handleTimeChange} className="p-2 border " />
              </Label>

              <div className="flex w-full gap-4">
                <Label htmlFor="price" className="flex flex-col w-full space-y-4 flex-[3] ">
                  <span>Price</span>
                  <Input id="price" name="price" type="number" min="1" value={timing.price} onChange={handleTimeChange} className="p-2 border" />
                </Label>

                <Label htmlFor="included" className="flex flex-col w-full space-y-4 flex-1">
                  <span className="text-nowrap">Include in Package</span>
                  <Switch
                    id="included"
                    name="included" // Name is used to dynamically update the state
                    checked={timing?.included}
                    onCheckedChange={(checked) =>
                      setTiming((prevTiming) => ({
                        ...prevTiming,
                        included: checked,
                      }))
                    }
                    className="data-[state=checked]:bg-secondaryDark ease-in-out duration-500"
                  />
                </Label>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-4">
              <Button onClick={handleUpdateItinerary} className="p-2 rounded-md w-full bg-secondaryDark">
                Submit
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
