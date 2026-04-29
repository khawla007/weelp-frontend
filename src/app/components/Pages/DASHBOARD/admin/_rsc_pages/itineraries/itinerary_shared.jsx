// File Handle Shard Component Regarding Itineraries
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { authApi } from '@/lib/axiosInstance';
import { useToast } from '@/hooks/use-toast';
import { log } from '@/lib/utils';
import { isEmpty } from 'lodash';
import { ArrowLeft, SearchIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import TimeSelector from './TimeSelector';

export const NavigationItinerary = ({ title, desciption }) => {
  const router = useRouter();
  if (title && desciption) {
    return (
      <div className="flex items-center gap-3 w-full py-4">
        <ArrowLeft className="cursor-pointer" onClick={() => router.back()} />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{desciption}</p>
        </div>
      </div>
    );
  }
  return <div className="flex justify-between w-full py-4 font-extrabold"> Props Not Passed </div>;
};

export const ActivitySearchModal = ({ day, onClose, cityIds = [], addActivity, apiPrefix = 'admin' }) => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Stable string for dependency to avoid infinite re-renders
  const cityIdsKey = cityIds.join(',');

  // Fetch activities from backend filtered by city_ids
  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const response = await authApi.get(`/api/${apiPrefix}/activities?city_ids=${cityIdsKey}&all=true`);
        const body = response?.data;
        const data = body?.data?.data || body?.data || [];
        setActivities(Array.isArray(data) ? data : []);
        setFilteredActivities(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching activities:', error);
        setActivities([]);
        setFilteredActivities([]);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [cityIdsKey, apiPrefix]);

  // Client-side search filter on fetched activities
  const handleSearch = useCallback(
    (e) => {
      const term = e.target.value.toLowerCase();
      setSearchTerm(term);
      if (!term) {
        setFilteredActivities(activities);
      } else {
        setFilteredActivities(activities.filter((a) => a.name?.toLowerCase().includes(term)));
      }
    },
    [activities],
  );

  const [timing, setTiming] = useState({
    start_time: '10:00',
    end_time: '10:00',
    notes: '',
    price: '',
    included: false,
  });

  const handleSelectActivity = (activity) => {
    setSelectedActivity(activity);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedActivity(null);
  };

  const handleAddActivity = () => {
    if (!selectedActivity) return;
    if (!timing.start_time || !timing.end_time) {
      toast({ variant: 'destructive', title: 'Missing time', description: 'Please provide both start and end times.' });
      return;
    }
    if (timing.start_time === timing.end_time) {
      toast({ variant: 'destructive', title: 'Invalid time range', description: 'Start and end time cannot be the same.' });
      return;
    }
    addActivity({
      day,
      activity_id: selectedActivity?.id,
      activitydata: selectedActivity,
      ...timing,
    });
    toast({ title: 'Activity added', description: `${selectedActivity?.name} added to day ${day}.` });
    closeModal();
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
        <div className={`${!modalOpen ? 'block' : 'hidden'} space-y-4`}>
          <DialogHeader className="space-y-4">
            <DialogTitle>Search Activity</DialogTitle>
            <DialogDescription className="sr-only">Search and add an activity to your schedule.</DialogDescription>
            <p className="text-sm text-muted-foreground">Day {day}</p>
          </DialogHeader>

          <div className="w-full flex gap-4 items-center">
            <Input type="text" placeholder="Search Activity..." value={searchTerm} className="w-full border p-2 focus-visible:ring-secondaryDark focus-visible:ring-1" onChange={handleSearch} />
            <Button className="bg-white hover:bg-white border">
              <SearchIcon className="text-black" />
            </Button>
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {loading ? (
              <li className="flex items-center justify-center p-4 text-muted-foreground">
                <Loader2 className="animate-spin mr-2 h-4 w-4" /> Loading activities...
              </li>
            ) : filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => (
                <li className="list-none hover:bg-neutral-100 cursor-pointer p-2" onClick={() => handleSelectActivity(activity)} key={activity?.id}>
                  {activity?.name}
                </li>
              ))
            ) : (
              <li className="list-none p-2 text-muted-foreground">No activities found for selected cities.</li>
            )}
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
                    <TimeSelector id="start_time" value={timing.start_time} onChange={(v) => handleTimeChange({ target: { name: 'start_time', value: v } })} />
                  </Label>

                  <Label htmlFor="end_time" className="flex flex-col w-full space-y-4 ">
                    <span>End Time</span>
                    <TimeSelector id="end_time" value={timing.end_time} onChange={(v) => handleTimeChange({ target: { name: 'end_time', value: v } })} />
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
                    <span className="text-nowrap">Include in Itinerary</span>
                    <div className="flex items-center h-10">
                      <Switch
                        id="included"
                        name="included"
                        checked={timing?.included}
                        onCheckedChange={(checked) =>
                          setTiming((prevTiming) => ({
                            ...prevTiming,
                            included: checked,
                          }))
                        }
                        className="data-[state=checked]:bg-secondaryDark ease-in-out duration-500"
                      />
                    </div>
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
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const filteredTransfers = !searchTerm ? transfers : transfers.filter((t) => t?.name?.toLowerCase().includes(searchTerm));

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value.toLowerCase());
  }, []);

  const [timing, setTiming] = useState({
    start_time: '10:00',
    end_time: '10:00',
    notes: '',
    price: '',
    included: true,
    pickup_location: '',
    dropoff_location: '',
    pax: '',
    bag_count: 0,
    waiting_minutes: 0,
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
    if (isEmpty(selectedTransfer)) return;
    if (!timing.start_time || !timing.end_time) {
      toast({ variant: 'destructive', title: 'Missing time', description: 'Please provide both start and end times.' });
      return;
    }
    if (timing.start_time === timing.end_time) {
      toast({ variant: 'destructive', title: 'Invalid time range', description: 'Start and end time cannot be the same.' });
      return;
    }
    addTransfer({
      day,
      transfer_id: selectedTransfer?.id,
      transferData: selectedTransfer,
      ...timing,
      pax: timing.pax === '' ? null : Number(timing.pax),
      bag_count: Number(timing.bag_count) || 0,
      waiting_minutes: Number(timing.waiting_minutes) || 0,
    });
    toast({ title: 'Transfer added', description: `${selectedTransfer?.name} added to day ${day}.` });
    closeModal();
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
            <Input type="text" placeholder="Search transfers..." value={searchTerm} onChange={handleSearch} className="w-full border p-2 focus-visible:ring-secondaryDark focus-visible:ring-1" />
            <Button className="bg-white hover:bg-white border">
              <SearchIcon className="text-black" />
            </Button>
          </div>

          {/* Transfers Items */}
          <ul className="max-h-60 overflow-y-auto">
            {filteredTransfers.length > 0 ? (
              filteredTransfers.map((transfer) => (
                <li className="list-none hover:bg-neutral-100 cursor-pointer p-2" onClick={() => handleSelectTransfer(transfer)} key={transfer?.id}>
                  {transfer?.name}
                </li>
              ))
            ) : (
              <li className="list-none p-2 text-muted-foreground">No transfers found for selected cities.</li>
            )}
          </ul>
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
                    <span className="text-nowrap">Include in Itinerary</span>
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
                  <Input id="pax" name="pax" type="number" min="1" value={timing.pax || ''} onChange={handleTimeChange} className="p-2 border" />
                </Label>

                <div className="flex w-full gap-4">
                  <Label htmlFor="bag_count" className="flex flex-col w-full space-y-4 ">
                    <span>Extra bags</span>
                    <Input id="bag_count" name="bag_count" type="number" min="0" value={timing.bag_count} onChange={handleTimeChange} className="p-2 border" />
                  </Label>
                  <Label htmlFor="waiting_minutes" className="flex flex-col w-full space-y-4 ">
                    <span>Waiting (minutes)</span>
                    <Input id="waiting_minutes" name="waiting_minutes" type="number" min="0" value={timing.waiting_minutes} onChange={handleTimeChange} className="p-2 border" />
                  </Label>
                </div>
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

/** Edit Form Activity Schedules  */
export const CustomizedEditActivityForm = ({ isEditOn, updateActivity, day, selectedActivity, onClose, activities }) => {
  const { toast } = useToast();
  const [timing, setTiming] = useState({
    start_time: selectedActivity?.start_time || '10:00',
    end_time: selectedActivity?.end_time || '10:00',
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
    if (!selectedActivity) return;
    if (!timing.start_time || !timing.end_time) {
      toast({ variant: 'destructive', title: 'Missing time', description: 'Please provide both start and end times.' });
      return;
    }
    if (timing.start_time === timing.end_time) {
      toast({ variant: 'destructive', title: 'Invalid time range', description: 'Start and end time cannot be the same.' });
      return;
    }
    const activityIndex = activities.findIndex((activity) => activity.activity_id === selectedActivity.activity_id && activity.day === selectedActivity.day);
    if (activityIndex === -1) {
      toast({ variant: 'destructive', title: 'Activity not found', description: 'Activity not found for the selected day.' });
      return;
    }
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
    updateActivity(updatedActivities);
    toast({ title: 'Activity updated', description: `${selectedActivity?.activitydata?.name ?? 'Activity'} updated.` });
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
                  <TimeSelector id="start_time" value={timing.start_time} onChange={(v) => handleTimeChange({ target: { name: 'start_time', value: v } })} />
                </Label>

                <Label htmlFor="end_time" className="flex flex-col w-full space-y-4 ">
                  <span>End Time</span>
                  <TimeSelector id="end_time" value={timing.end_time} onChange={(v) => handleTimeChange({ target: { name: 'end_time', value: v } })} />
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
                  <span className="text-nowrap">Include in Itinerary</span>
                  <Switch
                    id="included"
                    name="included"
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
  const { toast } = useToast();
  const [timing, setTiming] = useState({
    start_time: selectedTransfer?.start_time || '10:00',
    end_time: selectedTransfer?.end_time || '10:00',
    notes: selectedTransfer?.notes ?? '',
    price: selectedTransfer?.price ?? '',
    included: selectedTransfer.included ?? false,
    pickup_location: selectedTransfer?.pickup_location ?? '',
    dropoff_location: selectedTransfer?.dropoff_location ?? '',
    pax: selectedTransfer?.pax ?? '',
    bag_count: selectedTransfer?.bag_count ?? 0,
    waiting_minutes: selectedTransfer?.waiting_minutes ?? 0,
  });
  /** handle for input timing change */
  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setTiming((prevTiming) => ({
      ...prevTiming,
      [name]: value,
    }));
  };
  /**  Updating Transfer */
  const handleUpdateTransfer = () => {
    if (!selectedTransfer) return;
    if (!timing.start_time || !timing.end_time) {
      toast({ variant: 'destructive', title: 'Missing time', description: 'Please provide both start and end times.' });
      return;
    }
    if (timing.start_time === timing.end_time) {
      toast({ variant: 'destructive', title: 'Invalid time range', description: 'Start and end time cannot be the same.' });
      return;
    }
    const transferIndex = transfers.findIndex((transfer) => transfer?.transfer_id == selectedTransfer?.transfer_id);
    const dayIndex = transfers.findIndex((transfer) => transfer?.day == selectedTransfer?.day);
    if (transferIndex === -1 || dayIndex === -1) {
      toast({ variant: 'destructive', title: 'Transfer not found', description: 'Transfer not found for the selected day.' });
      return;
    }
    updateTransfer(transferIndex, {
      ...transfers[transferIndex],
      transferData: selectedTransfer?.transferData,
      start_time: timing.start_time,
      end_time: timing.end_time,
      notes: timing?.notes,
      price: timing?.price,
      included: timing?.included,
      pickup_location: timing?.pickup_location,
      dropoff_location: timing?.dropoff_location,
      pax: timing.pax === '' ? null : Number(timing.pax),
      bag_count: Number(timing.bag_count) || 0,
      waiting_minutes: Number(timing.waiting_minutes) || 0,
    });
    toast({ title: 'Transfer updated', description: `${selectedTransfer?.transferData?.name ?? 'Transfer'} updated.` });
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
                  <span className="text-nowrap">Include in Itinerary</span>
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
                <Input id="pax" name="pax" type="number" min="1" value={timing.pax || ''} onChange={handleTimeChange} className="p-2 border" />
              </Label>
              <div className="flex w-full gap-4">
                <Label htmlFor="bag_count" className="flex flex-col w-full space-y-4 ">
                  <span>Extra bags</span>
                  <Input id="bag_count" name="bag_count" type="number" min="0" value={timing.bag_count} onChange={handleTimeChange} className="p-2 border" />
                </Label>
                <Label htmlFor="waiting_minutes" className="flex flex-col w-full space-y-4 ">
                  <span>Waiting (minutes)</span>
                  <Input id="waiting_minutes" name="waiting_minutes" type="number" min="0" value={timing.waiting_minutes} onChange={handleTimeChange} className="p-2 border" />
                </Label>
              </div>
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
