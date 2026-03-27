import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import MyBookings from './pages/MyBookings';

function App() {
  const isAuthenticated = !!localStorage.getItem('access_token');

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />

      <Route
        path="/"
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/bookings"
        element={isAuthenticated ? <MyBookings /> : <Navigate to="/login" replace />}
      />

      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
    </Routes>
  );
}

export default App;