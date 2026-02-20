import React from 'react';
import dynamic from 'next/dynamic';

const CreateVendorAvailabilityDialog = dynamic(() => import('../modals/CreateVendorAvailabilityDialog')); // import dialog Form
const FilterVendorAvailabilityPage = dynamic(() => import('../vendor_filters/FilterVendorAvailabilityPage')); // import Filter Vendor Avaialabliltiy Form

const CreateVendorAvailabilityPage = () => {
  return (
    <div>
      <CreateVendorAvailabilityDialog title={'Availability'} desciption={'Manage transfer time slots and availability'} label={'Add Time Slot'} />
      <FilterVendorAvailabilityPage />
    </div>
  );
};

export default CreateVendorAvailabilityPage;
