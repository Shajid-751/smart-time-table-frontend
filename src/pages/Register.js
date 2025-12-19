import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';

function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', department: '' });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
  e.preventDefault();
  try {
    
    const res = await axios.post('https://smart-time-table-backend-1.onrender.com/api/register', formData);
    alert("Completed Successfully : " + res.data.message); 
    navigate('/'); 
  } catch (err) {
    
    console.error(err);
    alert("Fail: " + (err.response?.data?.message || "Server Connection Problem"));
  }
};

  return (
    <div className="container">
      <h2>Create Admin Account</h2>
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="Full Name" required onChange={e => setFormData({...formData, username: e.target.value})} />
        <input type="email" placeholder="Email Address" required onChange={e => setFormData({...formData, email: e.target.value})} />
        <input type="password" placeholder="Password" required onChange={e => setFormData({...formData, password: e.target.value})} />
        <input type="text" placeholder="Department (e.g. CSE)" required onChange={e => setFormData({...formData, department: e.target.value})} />
        <button type="submit">Sign Up</button>
      </form>
      <p className="sample-text">Already have an account? <Link to="/">Login here</Link></p>
    </div>
  );
}

export default Register;
