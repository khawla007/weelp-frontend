import React from 'react';

const Sidebar = ({ dispatch, data }) => {
  const categories = [...new Set(data.map((val) => val.category))]; //fake data based category
  const handleCategoryChange = (e) => {
    const category = e.target.id; // Get the category from the checkbox's id
    dispatch({ type: 'UPDATE_CATEGORY', payload: category });
  };

  return (
    <div className="bg-white p-8 max-w-xs h-fit w-full rounded-lg flex flex-col gap-2">
      <h3 className="text-[#143042] text-lg">Categories</h3>
      <ul>
        {categories.map((val, index) => (
          <li key={index}>
            <label htmlFor={val} className="capitalize flex items-center gap-2 cursor-pointer mt-4">
              <input
                type="checkbox"
                id={val} // Use the category name as the id
                className="checked:accent-secondaryDark size-5"
                onChange={handleCategoryChange} // Call the updated handler
              />
              <span className="text-[#435A67] font-medium text-lg">{val}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
