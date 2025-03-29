import './assets/css/main.css';
import React, { useState } from "react";      
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // Changed import
import Dashboard from "./pages/Dashboard";
import Users from "./pages/user/Users";
import Settings from "./pages/Settings";
import UserAdd from "./pages/user/UserAdd";
import CustomLayout from './components/CustomLayout';
import Login from './pages/Auth/Login';
import UserDetails from './pages/user/UserDetails';
import 'antd/dist/reset.css';
import { UserContext } from './context/user.context';
import { ToastContainer } from 'react-toastify';

import MoodCRUD from './pages/Mood/MoodCRUD';
import MoodGenreCRUD from './pages/MoodGenre/MoodGenreCRUD';
import SuggestionCRUD from './pages/Suggestion/SuggestionCRUD';
import CapturedImageCRUD from './pages/CapturedImage/CapturedImageCRUD';


function App() {
  const [_user, _setUser]  = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
  return (
    <UserContext.Provider value = {{_user, _setUser}}>
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
            <Route path="user/details/:userId" element={<UserDetails />} />

            <Route path='moods' element={<MoodCRUD/>} />
            <Route path='mood-genres' element={<MoodGenreCRUD/>} />
            <Route path='suggestions' element={<SuggestionCRUD/>} />
            <Route path='captured-images' element={<CapturedImageCRUD/>} />

            <Route path="settings" element={<Settings />} />


            
          </Route>

          {/* Catch all undefined routes */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer />

    </UserContext.Provider>
  );
}

export default App;
