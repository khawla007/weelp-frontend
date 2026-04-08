'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { SearchIcon, Clock, Car, MapPin, ArrowLeft, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCityTransfers, getCityPlaces } from '@/lib/actions/creatorItineraries';

export default function TransferSearchModalPublic({ open, onOpenChange, slug, onSelect }) {
  const [transfers, setTransfers] = useState([]);
  const [places, setPlaces] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Stage: 'search' or 'configure'
  const [stage, setStage] = useState('search');
  const [selectedTransfer, setSelectedTransfer] = useState(null);

  // Configure form state
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [pickupTime, setPickupTime] = useState('');

  // Fetch transfers and places when modal opens
  useEffect(() => {
    if (!open || !slug) return;
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      const [transfersRes, placesRes] = await Promise.all([getCityTransfers(slug), getCityPlaces(slug)]);
      if (!cancelled) {
        if (transfersRes.success) setTransfers(transfersRes.data || []);
        if (placesRes.success) setPlaces(placesRes.data || []);
        setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [open, slug]);

  // Client-side filter by name
  const filtered = transfers.filter((t) => t.name?.toLowerCase().includes(search.toLowerCase()));

  const resetModal = useCallback(() => {
    setStage('search');
    setSelectedTransfer(null);
    setSearch('');
    setPickupLocation('');
    setDropoffLocation('');
    setPickupTime('');
  }, []);

  const handleSelectTransfer = (transfer) => {
    setSelectedTransfer(transfer);
    setStage('configure');
  };

  const handleBack = () => {
    setStage('search');
    setSelectedTransfer(null);
    setPickupLocation('');
    setDropoffLocation('');
    setPickupTime('');
  };

  const handleConfirm = () => {
    onSelect({
      transfer_id: selectedTransfer.id,
      name: selectedTransfer.name,
      vehicle_type: selectedTransfer.vehicle_type,
      duration: selectedTransfer.duration,
      featured_image: selectedTransfer.featured_image,
      seating_capacity: selectedTransfer.seating_capacity,
      pickup_location: pickupLocation,
      dropoff_location: dropoffLocation,
      start_time: pickupTime,
      end_time: null,
      notes: null,
      price: null,
      included: true,
      pax: null,
    });
    resetModal();
    onOpenChange(false);
  };

  const handleOpenChange = (value) => {
    if (!value) resetModal();
    onOpenChange(value);
  };

  const isConfigValid = pickupLocation && dropoffLocation && pickupTime;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{stage === 'search' ? 'Add Transfer' : 'Configure Transfer'}</DialogTitle>
          <DialogDescription className="sr-only">{stage === 'search' ? 'Search and select a transfer.' : 'Configure pickup and dropoff details.'}</DialogDescription>
        </DialogHeader>

        {/* Stage 1: Search */}
        {stage === 'search' && (
          <>
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search transfers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 focus-visible:ring-secondaryDark focus-visible:ring-1"
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1 -mx-2">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">{search ? 'No transfers match your search.' : 'No transfers available.'}</p>
              ) : (
                <ul className="space-y-1">
                  {filtered.map((transfer) => (
                    <li key={transfer.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-neutral-100 cursor-pointer transition-colors" onClick={() => handleSelectTransfer(transfer)}>
                      <div className="relative h-14 w-14 rounded-md overflow-hidden bg-neutral-200 flex-shrink-0">
                        {transfer.featured_image ? (
                          <Image src={transfer.featured_image} alt={transfer.name} fill className="object-cover" sizes="56px" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">No img</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{transfer.name}</p>
                        {transfer.pickup_place_name && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            <span>Place: {transfer.pickup_place_name}</span>
                          </p>
                        )}
                        {transfer.vehicle_type && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Car className="h-3 w-3" />
                            {transfer.vehicle_type}
                          </p>
                        )}
                        {transfer.duration && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {transfer.duration} min
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {/* Stage 2: Configure */}
        {stage === 'configure' && selectedTransfer && (
          <div className="space-y-4">
            {/* Selected transfer summary */}
            <div className="flex items-center gap-3 p-2 bg-neutral-50 rounded-md">
              <div className="relative h-10 w-10 rounded-md overflow-hidden bg-neutral-200 flex-shrink-0">
                {selectedTransfer.featured_image ? (
                  <Image src={selectedTransfer.featured_image} alt={selectedTransfer.name} fill className="object-cover" sizes="40px" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">No img</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedTransfer.name}</p>
                {selectedTransfer.vehicle_type && <p className="text-xs text-muted-foreground">{selectedTransfer.vehicle_type}</p>}
              </div>
            </div>

            {/* Pickup Location */}
            <Label className="flex flex-col space-y-2">
              <span className="text-sm font-medium">
                Pickup Location <span className="text-red-500">*</span>
              </span>
              <Select value={pickupLocation} onValueChange={setPickupLocation}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select pickup location" />
                </SelectTrigger>
                <SelectContent>
                  {places.map((place) => (
                    <SelectItem key={place.id} value={place.name}>
                      {place.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Label>

            {/* Dropoff Location */}
            <Label className="flex flex-col space-y-2">
              <span className="text-sm font-medium">
                Dropoff Location <span className="text-red-500">*</span>
              </span>
              <Select value={dropoffLocation} onValueChange={setDropoffLocation}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select dropoff location" />
                </SelectTrigger>
                <SelectContent>
                  {places.map((place) => (
                    <SelectItem key={place.id} value={place.name}>
                      {place.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Label>

            {/* Pickup Time */}
            <Label className="flex flex-col space-y-2">
              <span className="text-sm font-medium">
                Pickup Time <span className="text-red-500">*</span>
              </span>
              <Input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="focus-visible:ring-secondaryDark focus-visible:ring-1" />
            </Label>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleConfirm} disabled={!isConfigValid} className="flex-1 bg-secondaryDark hover:bg-secondaryDark/90">
                Confirm Transfer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
