import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '../components/AdminDashboard';
import MemberDashboard from '../components/MemberDashboard';
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
        first_name: 'Joshua',
        last_name: 'Espeso',
        role: 'STUDENT'
      });
      setLoading(false);
    }, 500);

  }, [navigate]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-[#FDFCF8] font-bold text-[#1a3626]">Loading LibTrack...</div>;
  }

  if (user?.role === 'LIBRARIAN' || user?.role === 'ADMIN') {
    return <AdminDashboard user={user} />;
  }

  if (user?.role === 'STUDENT' || user?.role === 'TEACHER') {
    return <MemberDashboard user={user} />;
  }

  return <div>Unknown Role</div>;
}

export default Dashboard;