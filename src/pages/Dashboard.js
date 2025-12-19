import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css'; 

function Dashboard() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(''); 
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({ department: '', subject: '', faculty: '', day: '', slot: '', room: '' });
  const [timetable, setTimetable] = useState([]);
  const [deptFilter, setDeptFilter] = useState('');
  const [facultySearch, setFacultySearch] = useState('');
  const [facultySchedule, setFacultySchedule] = useState([]);
  const [nextClass, setNextClass] = useState(null);

  const currentDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

  useEffect(() => {
    const savedRole = localStorage.getItem('userRole');
    const savedDept = localStorage.getItem('userDept'); 

    if (!savedRole) {
      navigate('/'); 
    } else {
      setUserRole(savedRole);
      if (savedDept) {
        setDeptFilter(savedDept.toUpperCase());
        autoFetchTimetable(savedDept.toUpperCase());
      }
    }
  }, [navigate]);

  const autoFetchTimetable = async (dept) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/timetable/${dept}`);
      setTimetable(res.data);
    } catch (err) { console.log("Auto-fetch error"); }
  };

  // --- 1. Definition-ah mela move panniten (Warning Fix) ---
  const sortedTimetable = [...timetable].sort((a, b) => {
    const getTime = (str) => {
      const hour = parseInt(str.split(':')[0] || str.split('-')[0]);
      return (hour >= 1 && hour <= 7) ? hour + 12 : hour;
    };
    return getTime(a.slot) - getTime(b.slot);
  });

  // --- 2. Dependency Array & Logic Alignment ---
  useEffect(() => {
    const checkNextClass = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const upcoming = sortedTimetable.find(item => {
        if (item.day !== currentDay) return false;

        const [hourStr, minStr] = item.slot.split(':');
        let hour = parseInt(hourStr);
        let minutes = parseInt(minStr) || 0;

        if (hour >= 1 && hour <= 7) hour += 12;
        const slotMinutes = hour * 60 + minutes;

        return slotMinutes > currentMinutes;
      });

      setNextClass(upcoming);
    };

    const timer = setInterval(checkNextClass, 10000);
    checkNextClass();

    return () => clearInterval(timer);
  }, [sortedTimetable, currentDay]); 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const formattedValue = name === "department" ? value.toUpperCase() : value;
    setFormData({ ...formData, [name]: formattedValue });
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  const handleLogout = () => {
    if(window.confirm("Confirm Logout?")) {
        localStorage.clear(); 
        navigate('/');
    }
  };

  const fetchTimetable = async () => {
    if (!deptFilter) return alert("Type Your Dept Name");
    try {
      const res = await axios.get(`http://localhost:5000/api/timetable/${deptFilter.toUpperCase()}`);
      setTimetable(res.data);
    } catch (err) { alert("Data Fetch error!"); }
  };

  const handleAdd = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/add-slot', formData);
      alert("✅ " + (res.data.message || "Slot Added Successfully!")); 
      if (formData.department === deptFilter.toUpperCase()) {
        fetchTimetable();
      }
    } catch (err) { 
      const errorMsg = err.response?.data?.message || "Clash Detected!";
      alert("⚠️ " + errorMsg); 
    }
  };

  const deleteSlot = async (id) => {
    if(window.confirm("Are You Want To Delete ?")) {
        try {
            await axios.delete(`http://localhost:5000/api/delete-slot/${id}`);
            fetchTimetable(); 
        } catch (err) { alert("Delete error!"); }
    }
  };

  const checkFacultyBusy = async () => {
    if (!facultySearch) return alert("Type Your Faculty Name!");
    try {
        const res = await axios.get(`http://localhost:5000/api/faculty/${facultySearch}`);
        setFacultySchedule(res.data);
    } catch (err) { alert("Search error!"); }
  };

  const isFormInvalid = !formData.department || !formData.subject || !formData.faculty || !formData.day || !formData.slot;

  return (
    <div className="dashboard-wrapper">
      <div className="container no-print" style={{ maxWidth: '850px' }}>
        
        {/* Reminder Alert Banner */}
        {nextClass && (
          <div style={{ 
            background: darkMode ? '#2d3436' : '#fff9db', 
            border: `2px solid ${darkMode ? '#667eea' : '#f1c40f'}`, 
            padding: '15px', 
            borderRadius: '10px', 
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            textAlign: 'left'
          }}>
            <span style={{ fontSize: '24px' }}>🔔</span>
            <div>
              <h4 style={{ margin: 0, color: darkMode ? '#667eea' : '#966917' }}>Next Class Reminder</h4>
              <p style={{ margin: 0, color: darkMode ? '#fff' : '#333' }}>
                Upcoming: <b>{nextClass.subject}</b> at <b>{nextClass.slot}</b> (Room: {nextClass.room})
              </p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>🗓️ Smart Timetable <span style={{fontSize: '14px', color: '#666'}}>({userRole.toUpperCase()} View)</span></h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={toggleDarkMode} style={{ background: '#34495e', width: 'auto', padding: '8px 15px' }}>
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button onClick={handleLogout} style={{ width: 'auto', background: '#e74c3c' }}>Logout</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
            <div className="container" style={{ flex: 1, background: darkMode ? '#3d3d3d' : '#f0f4ff', padding: '15px', textAlign: 'center' }}>
                <h3 style={{ margin: 0, color: '#3498db' }}>{timetable.length}</h3>
                <p className="sample-text" style={{ fontSize: '10px', fontWeight: 'bold' }}>TOTAL CLASSES</p>
            </div>
            <div className="container" style={{ flex: 1, background: darkMode ? '#2c3e50' : '#fff9db', padding: '15px', textAlign: 'center', border: '1px solid #f1c40f' }}>
                <h3 style={{ margin: 0, color: '#f39c12' }}>{timetable.filter(t => t.day === currentDay).length}</h3>
                <p className="sample-text" style={{ fontSize: '10px', fontWeight: 'bold' }}>TODAY'S ({currentDay})</p>
            </div>
            <div className="container" style={{ flex: 1, background: darkMode ? '#3d3d3d' : '#fff5f5', padding: '15px', textAlign: 'center' }}>
                <h3 style={{ margin: 0, color: '#e74c3c' }}>{[...new Set(timetable.map(t => t.faculty))].length}</h3>
                <p className="sample-text" style={{ fontSize: '10px', fontWeight: 'bold' }}>ACTIVE STAFF</p>
            </div>
        </div>

        {userRole === 'faculty' && (
          <div style={{marginTop: '20px', padding: '20px', background: darkMode ? '#2d2d2d' : '#fff', borderRadius: '10px', border: '1px solid #ddd'}}>
            <h4>🚀 Faculty Admin Panel</h4>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <input type="text" name="department" value={formData.department} placeholder="Dept (e.g. CSE)" onChange={handleInputChange} />
              <input type="text" name="subject" placeholder="Subject" onChange={handleInputChange} />
              <input type="text" name="faculty" placeholder="Faculty Name" onChange={handleInputChange} />
              <input type="text" name="room" placeholder="Room No" onChange={handleInputChange} />
              <input type="text" name="slot" placeholder="Time (e.g. 9:00)" onChange={handleInputChange} />
              <select name="day" onChange={handleInputChange}>
                <option value="">Select Day</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
              </select>
            </div>
            <button onClick={handleAdd} disabled={isFormInvalid} style={{marginTop: '15px'}}>Add to Timetable</button>
          </div>
        )}

        <div style={{ marginTop: '20px' }}>
          <h4>🔍 Search Timetable</h4>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" placeholder="Type Dept (e.g., CSE)" value={deptFilter} onChange={e => setDeptFilter(e.target.value.toUpperCase())} />
            <button onClick={fetchTimetable} style={{ background: '#34495e', width: '120px' }}>Show</button>
            <button onClick={() => window.print()} style={{ background: '#27ae60', width: '120px' }}>Print</button>
          </div>
        </div>
      </div>

      <div className="container no-print" style={{ maxWidth: '850px', marginTop: '20px', background: darkMode ? '#2d2d2d' : '#f9f9f9', padding: '15px', borderRadius: '10px' }}>
        <h4>🕵️ Faculty Busy Checker</h4>
        <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" placeholder="Enter Faculty Name..." onChange={e => setFacultySearch(e.target.value)} />
            <button onClick={checkFacultyBusy} style={{ background: '#8e44ad', width: '150px' }}>Check</button>
        </div>
        {facultySchedule.length > 0 && (
            <ul style={{ marginTop: '10px', fontSize: '14px', padding: '0', listStyle: 'none' }}>
                {facultySchedule.map((s, i) => (
                    <li key={i} style={{padding: '8px', background: darkMode ? '#3d3d3d' : '#fff', marginBottom: '5px', borderLeft: '4px solid red'}}>
                      🚫 {s.day} ({s.slot}): Busy in <b>{s.department}</b> dept
                    </li>
                ))}
            </ul>
        )}
      </div>

      <div className="table-container" style={{ width: '90%', margin: '40px auto', background: darkMode ? '#2d2d2d' : 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <h3>Timetable Results</h3>
        <table>
          <thead>
            <tr>
              <th>Day</th><th>Time</th><th>Subject</th><th>Faculty</th><th>Room</th>
              {userRole === 'faculty' && <th className="no-print">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {sortedTimetable.map((item, index) => {
              const isToday = item.day === currentDay;
              return (
                <tr key={index} style={{ 
                  background: isToday ? (darkMode ? '#897BC1' : '#e3f2fd') : 'transparent',
                  borderLeft: isToday ? '5px solid #3498db' : 'none'
                }}>
                  <td style={{ fontWeight: isToday ? 'bold' : 'normal' }}>
                    {isToday ? `🌟 ${item.day}` : item.day}
                  </td>
                  <td style={{ fontWeight: 'bold', color: isToday ? '#4271a5ff' : (darkMode ? '#fff' : '#2c3e50') }}>{item.slot}</td>
                  <td>{item.subject}</td>
                  <td>{item.faculty}</td>
                  <td>{item.room}</td>
                  {userRole === 'faculty' && (
                    <td className="no-print">
                       <button onClick={() => deleteSlot(item._id)} style={{ background: '#ff4757', width: 'auto', padding: '5px 10px' }}>Delete</button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;