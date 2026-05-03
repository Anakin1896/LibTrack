import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '../components/AdminDashboard';
import api from '../api';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {

    const token = localStorage.getItem('access_token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    setTimeout(() => {
      setUser({
        first_name: 'Ana',
        last_name: 'Reyes',
        role: 'LIBRARIAN'
      });
      setLoading(false);
    }, 500);

  }, [navigate]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-[#FDFCF8]">Loading LibTrack...</div>;
  }

  if (user?.role === 'LIBRARIAN' || user?.role === 'ADMIN') {
    return <AdminDashboard user={user} />;
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Student Catalog</h1>
      <p>Welcome, {user?.first_name}. The student view is under construction.</p>
    </div>
  );
}

export default Dashboard;