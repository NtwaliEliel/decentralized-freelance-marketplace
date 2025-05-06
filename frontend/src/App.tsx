import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';

// Components
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import JobList from './pages/JobList';
import JobDetail from './pages/JobDetail';
import CreateJob from './pages/CreateJob';
import FreelancerProfile from './pages/FreelancerProfile';
import Messages from './pages/Messages';
import Login from './pages/Login';

function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/jobs" element={<JobList />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/create-job" element={<CreateJob />} />
              <Route path="/profile/:id" element={<FreelancerProfile />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </main>
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App; 