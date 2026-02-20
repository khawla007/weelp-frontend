import React from 'react';
import dynamic from 'next/dynamic';

const CreateVendorVehicleDialog = dynamic(() => import('../modals/CreateVendorVehicleDialog')); // import dialog Form
const FilterVendorVehiclePage = dynamic(() => import('../vendor_filters/FilterVendorVehiclePage')); // import Filter Vendor Avaialabliltiy Form

const CreateVendorVehiclePage = () => {
  return (
    <div>
      <CreateVendorVehicleDialog title={'Vehicles'} desciption={'Manage your fleet of vehicles'} label={'Add Vehicle'} />
      <FilterVendorVehiclePage />
    </div>
  );
};

export default CreateVendorVehiclePage;
