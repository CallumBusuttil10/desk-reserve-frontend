import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword'; // NEW
import ResetPassword from './pages/ResetPassword';   // NEW
import MyBookings from './pages/MyBookings';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} /> {/* NEW */}
      <Route path="/reset-password/:uid/:token" element={<ResetPassword />} /> {/* NEW: Notice the URL params! */}
      <Route path="/bookings" element={<MyBookings />} />
      <Route path="/" element={<Dashboard />} />
    </Routes>
  );
}

export default App;