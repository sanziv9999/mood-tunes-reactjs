import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import '@ant-design/v5-patch-for-react-19';

import App from './App';
import reportWebVitals from './reportWebVitals';// Your Login component
import Login from './pages/Auth/Login';
import Users from './pages/user/Users';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App>
      <Login />
      <Users />
    </App>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
