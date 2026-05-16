import React from 'react';
import BookingForm from '../Form/Form';
import { Plus } from 'lucide-react';

const ModalForm = ({ showForm, setShowForm, handleShowForm }) => {
  return (
    <div
      id="portal_form"
      className={`fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center z-50 transition-[opacity,visibility] duration-300 ease-[var(--weelp-ease-out)] motion-reduce:transition-none ${
        showForm ? 'visible opacity-100' : 'invisible opacity-0'
      }`}
    >
      <div
        className={`w-full flex justify-center items-center gap-6 transition-transform duration-300 ease-[var(--weelp-ease-panel)] motion-reduce:transition-none ${showForm ? 'translate-y-14' : '-translate-y-40'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <BookingForm />
        </div>
        <button className="text-white border-white rotate-45 transition-transform duration-200 ease-[var(--weelp-ease-out)] motion-reduce:transition-none hover:scale-110" onClick={handleShowForm}>
          <Plus size={28} />
        </button>
      </div>
    </div>
  );
};

export default ModalForm;
