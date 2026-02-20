export const VendorNoResultFound = ({ text = '' }) => {
  if (!text) {
    return (
      <div className="h-[50vh] flex items-center flex-col justify-center gap-4">
        <h2 className="text-Blueish font-semibold text-base sm:text-2xl ">Not Found</h2>
        <p>Could not find requested resource</p>
      </div>
    );
  }

  return (
    <div className="h-[50vh] flex items-center flex-col justify-center gap-4">
      <h2 className="text-Blueish font-semibold text-base sm:text-2xl ">Not Found</h2>
      <p>{text}</p>
    </div>
  );
};
