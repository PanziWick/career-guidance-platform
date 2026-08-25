import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, ArrowRight, UserCircle, Target, Map, Zap, BookOpen } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [recentRecs, setRecentRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profRes, recRes] = await Promise.all([
          apiClient.get('/academic-profile/me'),
          apiClient.get('/recommendations').catch(() => null)
        ]);
        setProfileData(profRes.data);
        if (recRes && recRes.data && recRes.data.length > 0) {
          setRecentRecs(recRes.data[0].results.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="loading-spinner">Loading dashboard data...</div>;
  }

  const completenessObj = profileData?.completeness || { isComplete: false, fields: {} };
  const fields = Object.values(completenessObj.fields || {});
  const completedCount = fields.filter(Boolean).length;
  const totalFields = fields.length || 5; 
  const completeness = Math.round((completedCount / totalFields) * 100);
  const isComplete = completenessObj.isComplete;

  return (
    <div className="animate-fade-in">
      {/* Hero Banner */}
      <div className="glass-panel mb-8 border-none" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(30, 30, 45, 0.8) 100%)', display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '2rem' }}>
        <div style={{ background: 'var(--color-primary)', padding: '1rem', borderRadius: '50%', boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}>
          <UserCircle size={48} color="white" />
        </div>
        <div>
          <h1 style={{ marginBottom: '0.5rem', fontSize: '2.5rem', background: 'linear-gradient(to right, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className="text-muted" style={{ fontSize: '1.1rem' }}>Your personal higher education and career pathway dashboard.</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Profile Completeness */}
        <div className="glass-panel w-full flex items-center justify-between">
          <div>
            <h3 className="mb-2">Profile Completeness</h3>
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>
              {isComplete 
                ? 'Your profile is complete! You can now generate recommendations and roadmaps.' 
                : 'Please complete your academic profile to unlock personalized features.'}
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

        {/* Quick Actions 2x2 Grid */}
        <div className="grid gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
          
          {/* Action 1: Academic Profile */}
          <div className="glass-panel flex flex-col justify-between" style={{ transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <BookOpen size={24} color="var(--color-primary-light)" style={{ flexShrink: 0 }} />
                <h3 style={{ margin: 0, lineHeight: 1 }}>Academic Profile</h3>
              </div>
              <p className="text-muted mb-4" style={{ fontSize: '0.875rem' }}>Update your O/L, A/L results, and career preferences to improve matches.</p>
            </div>
            <Link to="/profile" className="btn btn-primary w-full justify-center">
              <span>Manage Profile</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Action 2: Recommendations */}
          <div className="glass-panel flex flex-col justify-between" style={{ transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Zap size={24} color="var(--color-warning)" style={{ flexShrink: 0 }} />
                <h3 style={{ margin: 0, lineHeight: 1 }}>Recommendations</h3>
              </div>
              <p className="text-muted mb-4" style={{ fontSize: '0.875rem' }}>Discover top state and private university degrees curated for you.</p>
            </div>
            {isComplete ? (
               <Link to="/recommendations" className="btn btn-outline w-full justify-center" style={{ border: '1px solid var(--color-primary-light)' }}>
                 <span>View Recommendations</span>
                 <ArrowRight size={16} />
               </Link>
            ) : (
               <button disabled className="btn btn-outline w-full justify-center" title="Complete your profile first">
                 Profile Incomplete
               </button>
            )}
          </div>

          {/* Action 3: Skill Gap Analysis */}
          <div className="glass-panel flex flex-col justify-between" style={{ transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Target size={24} color="var(--color-danger)" style={{ flexShrink: 0 }} />
                <h3 style={{ margin: 0, lineHeight: 1 }}>Skill Gap Analysis</h3>
              </div>
              <p className="text-muted mb-4" style={{ fontSize: '0.875rem' }}>Find out which skills you need to develop to achieve your dream career.</p>
            </div>
            {isComplete ? (
               <Link to="/skill-gap" className="btn btn-outline w-full justify-center" style={{ border: '1px solid var(--color-danger)' }}>
                 <span>Analyze Skills</span>
                 <ArrowRight size={16} />
               </Link>
            ) : (
               <button disabled className="btn btn-outline w-full justify-center" title="Complete your profile first">
                 Profile Incomplete
               </button>
            )}
          </div>

          {/* Action 4: Learning Roadmap */}
          <div className="glass-panel flex flex-col justify-between" style={{ transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Map size={24} color="var(--color-success)" style={{ flexShrink: 0 }} />
                <h3 style={{ margin: 0, lineHeight: 1 }}>Learning Roadmap</h3>
              </div>
              <p className="text-muted mb-4" style={{ fontSize: '0.875rem' }}>Get a step-by-step learning roadmap and resources to bridge your gaps.</p>
            </div>
            {isComplete ? (
               <Link to="/roadmap" className="btn btn-outline w-full justify-center" style={{ border: '1px solid var(--color-success)' }}>
                 <span>View Roadmap</span>
                 <ArrowRight size={16} />
               </Link>
            ) : (
               <button disabled className="btn btn-outline w-full justify-center" title="Complete your profile first">
                 Profile Incomplete
               </button>
            )}
          </div>
        </div>
        
        {/* Recent Recommendations */}
        {recentRecs.length > 0 && (
          <div className="glass-panel w-full mt-2">
            <h3 className="mb-4 flex items-center gap-2"><Zap size={20} color="var(--color-warning)" /> Top Recommended Degrees</h3>
            <div className="grid gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              {recentRecs.map((rec, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--color-primary-light)' }}>{rec.name}</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px' }}>
                      <div style={{ width: `${Math.min(100, Math.round((rec.score / 17) * 100))}%`, height: '100%', background: 'var(--color-success)', borderRadius: '3px' }}></div>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{Math.min(100, Math.round((rec.score / 17) * 100))}% Match</span>
                  </div>
                  <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    🎓 {rec.university || 'Unknown University'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
