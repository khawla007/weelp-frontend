export const SingleProductPhotoGallery = ({ photos }) => {
  if (photos && photos.length > 0) {
    return (
      <ul className="flex flex-row gap-2 ">
        {photos.map((val, index) => {
          if (index > 2) {
            return null;
          }
          return (
            <li key={index} className="w-80 h-60 border rounded-sm first:rounded-l-2xl last:rounded-r-2xl overflow-hidden">
              <img className="h-full w-full object-cover" src={val} alt={`Photo ${index + 1}`} />
            </li>
          );
        })}
      </ul>
    );
  }
  return null;
};
