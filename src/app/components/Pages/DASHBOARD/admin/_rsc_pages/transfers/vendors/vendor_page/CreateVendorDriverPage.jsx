import React from 'react';
import dynamic from 'next/dynamic';

const CreateVendorDriverDialog = dynamic(() => import('../modals/CreateVendorDriverDialog')); // import dialog Form
const FilterVendorDriverPage = dynamic(() => import('../vendor_filters/FilterVendorDriverPage')); // import Filter Vendor Avaialabliltiy Form

const CreateVendorDriverPage = () => {
  return (
    <div>
      <CreateVendorDriverDialog title={'Drivers'} desciption={'Manage your team of drivers'} label={'Add Driver'} />
      <FilterVendorDriverPage />
    </div>
  );
};

export default CreateVendorDriverPage;
