import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '') : 'http://localhost:5000';
import { useAuth } from '../../context/AuthContext';
import { 
  Building, 
  GraduationCap, 
  Briefcase, 
  Award, 
  GitMerge, 
  BookOpen, 
  Settings,
  Users 
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/admin/dashboard-stats`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setStats(response.data.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="loading-spinner">Loading dashboard...</div>;
  if (error) return <div className="alert-error animate-fade-in">{error}</div>;

  const cards = [
    { 
      title: 'Users', 
      count: stats?.users?.total, 
      link: '/admin/users',
      icon: <Users size={24} />,
      subtitle: `${stats?.users?.active || 0} active · ${stats?.users?.inactive || 0} inactive`
    },
    { 
      title: 'Universities', 
      count: stats?.universities, 
      link: '/admin/universities',
      icon: <Building size={24} />
    },
    { 
      title: 'Degree Programmes', 
      count: stats?.degrees, 
      link: '/admin/degrees',
      icon: <GraduationCap size={24} />
    },
    { 
      title: 'Careers', 
      count: stats?.careers, 
      link: '/admin/careers',
      icon: <Briefcase size={24} />
    },
    { 
      title: 'Skills', 
      count: stats?.skills, 
      link: '/admin/skills',
      icon: <Award size={24} />
    },
    { 
      title: 'Career Mappings', 
      count: stats?.careerMappings, 
      link: '/admin/career-mappings',
      icon: <GitMerge size={24} />
    },
    { 
      title: 'Learning Resources', 
      count: stats?.learningResources, 
      link: '/admin/learning-resources',
      icon: <BookOpen size={24} />
    },
    { 
      title: 'Recommendation Rules', 
      count: stats?.recommendationRules, 
      link: '/admin/recommendation-rules',
      icon: <Settings size={24} />
    }
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-gradient">Administrator Dashboard</h2>
        <p className="text-muted">
          Welcome back, {user?.firstName} {user?.lastName}. Here is an overview of the platform datasets.
        </p>
      </div>

      <div className="dashboard-grid">
        {cards.map((card) => (
          <div key={card.title} className="glass-panel stat-card">
            <div>
              <div className="stat-header">
                <div className="stat-icon">
                  {card.icon}
                </div>
                <h3 className="text-muted" style={{ fontSize: '1rem', marginBottom: 0, fontWeight: 500 }}>
                  {card.title}
                </h3>
              </div>
              <div className="stat-value mb-6">
                {card.count || 0}
              </div>
              {card.subtitle && (
                <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '-1rem', marginBottom: '0.5rem' }}>
                  {card.subtitle}
                </div>
              )}
            </div>
            
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
              <Link to={card.link} className="btn btn-outline w-full" style={{ justifyContent: 'center' }}>
                Manage {card.title}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
