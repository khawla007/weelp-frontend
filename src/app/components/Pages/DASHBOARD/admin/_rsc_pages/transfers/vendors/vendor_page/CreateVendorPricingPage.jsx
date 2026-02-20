import dynamic from 'next/dynamic';

const CreateVendorPricingDialog = dynamic(() => import('../modals/CreateVendorPricingDialog')); // import Createvendor Form
const FilterVendorPricingPage = dynamic(() => import('../vendor_filters/FilterVendorPricingPage')); // import Filter Vendor Route Form

const CreateVendorPricingPage = () => {
  return (
    <div>
      <CreateVendorPricingDialog title={'Pricing'} desciption={'Manage transfer pricing tiers and rates'} label={'Add Pricing Tier'} />
      <FilterVendorPricingPage />
    </div>
  );
};

export default CreateVendorPricingPage;
