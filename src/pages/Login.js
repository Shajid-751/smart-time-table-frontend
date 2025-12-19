import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [dept, setDept] = useState('');
  const [isRegister, setIsRegister] = useState(false); 
  const navigate = useNavigate();

  const handleAuth = async () => {
    const endpoint = isRegister ? 'register' : 'login';
    try {
      const res = await axios.post(`http://localhost:5000/api/${endpoint}`, { 
        email: email, 
        password: password,
        department: isRegister ? dept : undefined 
      });
      
      if (!isRegister) {
        localStorage.setItem('userRole', role);
        
        const userDepartment = res.data.user.department === 'STUDENT' ? '' : res.data.user.department;
        localStorage.setItem('userDept', userDepartment || ''); 
        
        alert("✅ Login Success!");
        navigate('/dashboard');
      } else {
        alert("✅ " + res.data.message);
        setIsRegister(false); 
      }
    } catch (err) {
      alert("❌ Error: " + (err.response?.data?.message || "Operation failed!"));
    }
  };

  return (
    <div className="login-wrapper">
      <div className="container">
        <h2>{isRegister ? 'REGISTER' : 'LOGIN'}</h2>
        
        <div style={{ textAlign: 'left' }}>
          <input 
            type="email" 
            placeholder="Email Address" 
            onChange={(e) => setEmail(e.target.value)} 
          />
          
          <input 
            type="password" 
            placeholder="Password" 
            onChange={(e) => setPassword(e.target.value)} 
          />

          {}
          {isRegister && (
            <input 
              type="text" 
              placeholder="Type Your Dept (e.g., CSE)" 
              onChange={(e) => setDept(e.target.value.toUpperCase())} 
              style={{ marginTop: '10px' }}
            />
          )}
          
          {!isRegister && (
            <div style={{ margin: '15px 0', padding: '0 5px' }}>
              <label className="sample-text" style={{ fontWeight: '600', display: 'block', marginBottom: '5px' }}>
                I am a:
              </label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>
          )}
        </div>

        <button onClick={handleAuth}>
          {isRegister ? 'REGISTER NOW' : 'LOGIN'}
        </button>

        <p className="sample-text" style={{ marginTop: '15px', cursor: 'pointer', color: '#667eea', fontWeight: 'bold' }} 
            onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
        </p>

        <p className="sample-text" style={{ opacity: 0.6 }}>
          Smart Timetable Management System
        </p>
      </div>
    </div>
  );
}

export default Login;