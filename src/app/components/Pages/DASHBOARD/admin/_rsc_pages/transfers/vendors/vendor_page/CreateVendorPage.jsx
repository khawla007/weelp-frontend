import dynamic from 'next/dynamic';
const CreateVendorDialog = dynamic(() => import('../modals/CreateVendorDialog')); // import Createvendor Form
const FilterVendorPage = dynamic(() => import('../vendor_filters/FilterVendorPage')); // import Createvendor Form

const CreateVendorPage = () => {
  return (
    <div>
      <CreateVendorDialog title={'Transfer Vendors'} desciption={'Manage your transfer service providers'} label={'Create Vendor'} />
      <FilterVendorPage />
    </div>
  );
};

export default CreateVendorPage;
