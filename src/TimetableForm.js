import React, { useState } from 'react';
import './TimetableForm.css';

function TimetableForm() {
  const [formData, setFormData] = useState({
    department: '', subject: '', faculty: '', day: '', slot: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log("Saving data:", formData);
  };

  return (
    <form className="input-form" onSubmit={handleSubmit}>
      <h2>Add New Slot</h2>
      <input type="text" placeholder="Department" onChange={(e) => setFormData({...formData, department: e.target.value})} />
      <input type="text" placeholder="Subject" onChange={(e) => setFormData({...formData, subject: e.target.value})} />
      <input type="text" placeholder="Faculty Name" onChange={(e) => setFormData({...formData, faculty: e.target.value})} />
      <select onChange={(e) => setFormData({...formData, day: e.target.value})}>
        <option>Select Day</option>
        <option>Monday</option>
        <option>Tuesday</option>
      </select>
      <button type="submit">Generate / Add Slot</button>
    </form>
  );
}

export default TimetableForm;