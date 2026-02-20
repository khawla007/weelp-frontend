import React from 'react';
import BookingForm from '../Form/Form';
import { Plus } from 'lucide-react';

const ModalForm = ({ showForm, setShowForm, handleShowForm }) => {
  return (
    <div id="portal_form" className={`fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center z-50 ease-in-out duration-700 ${showForm ? 'visible' : 'invisible'}`}>
      <div className={`w-full flex justify-center items-center gap-6 ease-in-out duration-700 ${showForm ? 'translate-y-14' : '-translate-y-40'}`} onClick={(e) => e.stopPropagation()}>
        <div>
          <BookingForm />
        </div>
        <button className="text-white border-white rotate-45 duration-500 hover:scale-125 " onClick={handleShowForm}>
          <Plus size={28} />
        </button>
      </div>
    </div>
  );
};

export default ModalForm;
