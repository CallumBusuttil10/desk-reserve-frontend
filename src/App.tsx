import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import MyBookings from './pages/MyBookings';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/bookings" element={<MyBookings />} />
      <Route path="/" element={<Dashboard />} />
    </Routes>
  );
}

export default App;