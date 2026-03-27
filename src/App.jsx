import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './components/Dashboard';
import Artists from './components/Artists';
import UserManagement from './components/Users';
import Products from './components/Products';
import Events from './components/Events';
import SystemSettings from './components/Settings';
import Gallery from './components/Gallery';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="artists" element={<Artists />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="products" element={<Products />} />
          <Route path="events" element={<Events />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="settings" element={<SystemSettings />} />
        </Route>
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
