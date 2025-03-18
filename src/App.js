import './assets/css/main.css';
import React from "react";      
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // Changed import
import Dashboard from "./pages/Dashboard";
import Users from "./pages/user/Users";
import Settings from "./pages/Settings";
import UserAdd from "./pages/user/UserAdd";
import CustomLayout from './components/Layout';
import Login from './pages/Auth/Login';
import UserDetails from './pages/user/UserDetails';
import 'antd/dist/reset.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected Routes with Layout */}
        <Route path="/admin" element={<CustomLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users /> } />
          <Route path="users/create" element={<UserAdd />} />
          <Route path="settings" element={<Settings />} />
          <Route path="user/details/:userId" element={<UserDetails />} />
        </Route>

        {/* Catch all undefined routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
