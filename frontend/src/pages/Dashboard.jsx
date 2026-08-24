import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiClient.get('/academic-profile/me');
        setProfileData(data.data);
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return <div className="loading-spinner">Loading dashboard data...</div>;
  }

  const completenessObj = profileData?.completeness || { isComplete: false, fields: {} };
  const fields = Object.values(completenessObj.fields || {});
  const completedCount = fields.filter(Boolean).length;
  const totalFields = fields.length || 5; // Fallback to 5 if empty
  const completeness = Math.round((completedCount / totalFields) * 100);
  const isComplete = completenessObj.isComplete;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1>Welcome, {user?.firstName || 'User'}!</h1>
        <p className="text-muted">Your higher education pathway dashboard</p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="glass-panel w-full flex items-center justify-between">
          <div>
            <h3 className="mb-2">Profile Completeness</h3>
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>
              {isComplete 
                ? 'Your profile is complete! You can now generate recommendations.' 
                : 'Please complete your academic profile to get personalized degree recommendations.'}
            </p>
            <div className="mt-4 flex items-center gap-4">
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${completeness}%`, height: '100%', background: 'var(--color-primary-light)', transition: 'width 0.5s ease' }}></div>
              </div>
              <span style={{ fontWeight: 600 }}>{completeness}%</span>
            </div>
          </div>
          <div className="ml-8">
            {isComplete ? (
              <CheckCircle size={48} color="var(--color-success)" />
            ) : (
              <AlertCircle size={48} color="var(--color-warning)" />
            )}
          </div>
        </div>

        <div className="flex gap-6" style={{ flexWrap: 'wrap' }}>
          <div className="glass-panel" style={{ flex: '1 1 calc(50% - 1.5rem)', minWidth: '300px' }}>
            <h3 className="mb-2">Academic Profile</h3>
            <p className="text-muted mb-4" style={{ fontSize: '0.875rem' }}>Update your O/L, A/L results, and career preferences.</p>
            <Link to="/profile" className="btn btn-primary w-full">
              <span>Manage Profile</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="glass-panel" style={{ flex: '1 1 calc(50% - 1.5rem)', minWidth: '300px' }}>
            <h3 className="mb-2">Recommendations</h3>
            <p className="text-muted mb-4" style={{ fontSize: '0.875rem' }}>Discover state and private university degrees.</p>
            {isComplete ? (
               <Link to="/recommendations" className="btn btn-outline w-full text-gradient" style={{ border: '1px solid var(--color-primary-light)' }}>
                 <span>View Recommendations</span>
                 <ArrowRight size={16} color="var(--color-primary-light)" />
               </Link>
            ) : (
               <button disabled className="btn btn-outline w-full" title="Complete your profile first">
                 Profile Incomplete
               </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
