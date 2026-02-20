'use client';

//this is dummy
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

const ShopFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Extract filters from URL
  const selectedCategory = searchParams.get('category')?.toLowerCase() || '';
  const selectedLocation = searchParams.get('location')?.toLowerCase() || '';
  const page = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${process.env.NEXT_PUBLIC_API_BASE_URLL}api/shop?page=${page}`)
      .then((response) => {
        const { data, categories_list, location_list, last_page } = response.data;
        setActivities(data);
        setCategories(categories_list);
        setLocations(location_list);
        setTotalPages(last_page);
      })
      .catch((error) => console.log('Error fetching data:', error))
      .finally(() => setLoading(false));
  }, [page, selectedCategory, selectedLocation]);

  const updateFilters = (key, value) => {
    const currentParams = new URLSearchParams(searchParams.toString());

    if (value) currentParams.set(key, String(value).toLowerCase());
    else currentParams.delete(key);

    if (key !== 'page') currentParams.set('page', '1');

    router.push(`?${currentParams.toString()}`, { scroll: false });
  };

  return (
    <section className="flex  border-t-2 mx-auto p-6">
      {/* Filters */}
      <div className="flex flex-1 flex-col gap-6 mb-6">
        {/* Category Filter */}
        <div>
          <h3 className="font-bold mb-2">Category</h3>
          <div className="flex flex-col space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="category"
                value=""
                checked={selectedCategory === ''}
                className="size-5 accent-secondaryDark border  border-[#435A67] cursor-pointer"
                onChange={() => updateFilters('category', '')}
              />
              <span>All Categories</span>
            </label>
            {categories.map((category) => (
              <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="category"
                  value={category.name.toLowerCase()}
                  checked={selectedCategory === category.name.toLowerCase()}
                  onChange={() => updateFilters('category', category.name.toLowerCase())}
                  className="size-5 accent-secondaryDark border  border-[#435A67] cursor-pointer"
                />
                <span>{category.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Location Filter */}
        <div>
          <h3 className="font-bold mb-2">Location</h3>
          <div className="flex flex-col space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="location"
                value=""
                checked={selectedLocation === ''}
                onChange={() => updateFilters('location', '')}
                className="size-5 accent-secondaryDark border  border-[#435A67] cursor-pointer"
              />
              <span>All Locations</span>
            </label>
            {locations.map((location) => (
              <label key={location.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="location"
                  value={location.name.toLowerCase()}
                  checked={selectedLocation === location.name.toLowerCase()}
                  onChange={() => updateFilters('location', location.name.toLowerCase())}
                  className="size-5 accent-secondaryDark border  border-[#435A67] cursor-pointer"
                />
                <span>{location.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-[4] w-full flex flex-wrap gap-4">
        {/* Show loading state */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {/* Activities List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className="p-4 border rounded-lg shadow">
                    <h3 className="text-lg font-bold">{activity.name}</h3>
                    <p className="text-sm text-gray-600">
                      {activity.price.currency} {activity.price.base_price || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500">{activity.categories.map((c) => c.name).join(', ')}</p>
                    <p className="text-sm text-gray-500">{activity.locations.map((l) => l.city).join(', ')}</p>
                  </div>
                ))
              ) : (
                <p>No Items found.</p>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ShopFilter;
