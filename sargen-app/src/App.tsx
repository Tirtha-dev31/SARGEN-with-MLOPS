import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './pages/Dashboard';
import CaseDetails from './pages/CaseDetails';
import AIChat from './pages/AIChat';
import Analytics from './pages/Analytics';
import Overview from './pages/Overview';
import DraftingStudio from './pages/DraftingStudio';
import Collaborate from './pages/Collaborate';
import ValidateSubmit from './pages/ValidateSubmit';
import Login from './pages/Login';
import Layout from './components/Layout';
import './index.css';

const queryClient = new QueryClient();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('sargen_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.loggedIn) {
        setIsAuthenticated(true);
        setUserInfo(user);
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (credentials: { email: string; name: string; role: string }) => {
    setIsAuthenticated(true);
    setUserInfo(credentials);
  };

  const handleLogout = () => {
    localStorage.removeItem('sargen_user');
    setIsAuthenticated(false);
    setUserInfo(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <Login onLogin={handleLogin} />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout userInfo={userInfo} onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/ai-chat" element={<AIChat />} />
            <Route path="/drafting" element={<DraftingStudio />} />
            <Route path="/drafting/:caseId" element={<DraftingStudio />} />
            <Route path="/collaborate" element={<Collaborate />} />
            <Route path="/collaborate/:caseId" element={<Collaborate />} />
            <Route path="/validate" element={<ValidateSubmit />} />
            <Route path="/validate/:caseId" element={<ValidateSubmit />} />
            <Route path="/case/:caseId" element={<CaseDetails />} />
          </Routes>
        </Layout>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
