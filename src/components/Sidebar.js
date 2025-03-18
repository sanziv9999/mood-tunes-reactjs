import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <ul>
        <li className="sidebar-menu">
          <NavLink to="/admin/dashboard" end>Dashboard</NavLink>
        </li>
        <li className="sidebar-menu">
          <NavLink to="/admin/users" end>Users</NavLink>
        </li>
        <li className="sidebar-menu">
          <NavLink to="/admin/settings" end>Settings</NavLink>
        </li>
        <li className="sidebar-menu">
          <NavLink to="/admin/logout" end>Logout</NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;