import React from 'react';
import dynamic from 'next/dynamic';

const CreateVendorScheduleDialog = dynamic(() => import('../modals/CreateVendorScheduleDialog')); // import dialog Form
const FilterVendorSchedulePage = dynamic(() => import('../vendor_filters/FilterVendorSchedulePage')); // import Filter Vendor Avaialabliltiy Form

const CreateVendorSchedulePage = () => {
  return (
    <div>
      <CreateVendorScheduleDialog title={'Schedules'} desciption={'Manage your fleet schedule and assignments'} label={'Add Schedule'} />
      <FilterVendorSchedulePage />
    </div>
  );
};

export default CreateVendorSchedulePage;
