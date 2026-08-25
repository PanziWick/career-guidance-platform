import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { Zap, Clock, Award, Building2, BookOpen, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Recommendations = () => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationId, setRecommendationId] = useState(null);
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/recommendations');
      // The backend returns history which is a list of recommendation documents.
      if (res.data && res.data.length > 0) {
        setHistory(res.data);
        // Just take the most recent generated batch by default
        setRecommendationId(res.data[0]._id);
        setRecommendations(res.data[0].results || []);
      } else {
        setHistory([]);
      }
    } catch (err) {
      setError('Failed to load recommendation history.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError('');
      const res = await apiClient.post('/recommendations', {});
      
      if (res.data && res.data.results) {
        setRecommendationId(res.data.recommendationId);
        setRecommendations(res.data.results);
      } else {
        setRecommendationId(null);
        setRecommendations([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate recommendations.');
    } finally {
      setGenerating(false);
      fetchHistory(); // Refresh history after generating a new one
    }
  };

  const handleSelectHistory = (e) => {
    const id = e.target.value;
    setRecommendationId(id);
    const selected = history.find(h => h._id === id);
    if (selected) {
      setRecommendations(selected.results || []);
    }
  };

  const goToSkillGap = (recId, targetCareerId) => {
    navigate('/skill-gap', { state: { recommendationId: recId, targetCareerId } });
  };

  return (
    <div className="animate-fade-in">
      
      {/* Premium Hero Header */}
      <div className="glass-panel mb-8 border-none flex items-center justify-between" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(30, 30, 45, 0.8) 100%)', padding: '2rem', flexWrap: 'wrap', gap: '2rem' }}>
        <div className="flex items-center gap-6">
          <div style={{ background: 'var(--color-secondary)', padding: '1rem', borderRadius: '50%', boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)' }}>
            <Sparkles size={40} color="white" />
          </div>
          <div>
            <h1 style={{ marginBottom: '0.5rem', fontSize: '2.5rem', background: 'linear-gradient(to right, #fff, #e9d5ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Your Recommendations
            </h1>
            <p className="text-muted" style={{ fontSize: '1.1rem' }}>Personalized university degree pathways tailored to your academic profile.</p>
          </div>
        </div>
        
        <button onClick={handleGenerate} className="btn btn-primary" disabled={generating} style={{ padding: '1rem 2rem', fontSize: '1.1rem', gap: '0.75rem', display: 'flex', alignItems: 'center' }}>
          <Zap size={20} />
          <span>{generating ? 'Analyzing your profile...' : 'Generate New Options'}</span>
        </button>
      </div>

      {/* History Selector */}
      {!loading && !generating && history.length > 0 && (
        <div className="glass-panel mb-6 flex items-center justify-between" style={{ padding: '1.5rem', flexWrap: 'wrap', gap: '1rem', borderLeft: '4px solid var(--color-secondary)' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem' }} className="flex items-center gap-2"><Clock size={20} color="var(--color-secondary)" /> Past Generated Pathways</h3>
            <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem', marginTop: '0.25rem' }}>Select a previously generated recommendation batch to review</p>
          </div>
          <select className="form-select" value={recommendationId || ''} onChange={handleSelectHistory} style={{ width: '100%', maxWidth: '350px', padding: '0.85rem 1rem', fontSize: '1.05rem', background: '#1e1e2d', color: '#fff', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '0.5rem', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            {history.map((rec, idx) => (
              <option key={rec._id} value={rec._id} style={{ background: '#1e1e2d', color: '#fff' }}>
                {idx === 0 ? 'Latest Batch - ' : ''}{new Date(rec.generatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && <div className="alert-error mb-6">{error}</div>}

      {/* Loading State */}
      {loading && (
        <div className="glass-panel flex flex-col items-center justify-center text-center" style={{ padding: '4rem 2rem', minHeight: '400px' }}>
           <div className="loading-spinner mb-4"></div>
           <p className="text-muted">Loading your previous recommendations...</p>
        </div>
      )}

      {/* Generating State Overlay */}
      {generating && !loading && (
        <div className="glass-panel flex flex-col items-center justify-center text-center" style={{ padding: '4rem 2rem', minHeight: '400px' }}>
           <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '2rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
             <Zap size={64} color="var(--color-secondary)" opacity={0.8} className="animate-pulse" />
           </div>
           <h3 className="mb-2" style={{ fontSize: '1.5rem' }}>AI Matching in Progress</h3>
           <p className="text-muted max-w-md mx-auto mb-6">
             We are scanning through thousands of degrees and careers to find the absolute best matches for your unique profile and skills.
           </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !generating && recommendations.length === 0 && (
        <div className="glass-panel flex flex-col items-center justify-center text-center" style={{ padding: '5rem 2rem', minHeight: '450px' }}>
          <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '2.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <Award size={72} color="var(--color-secondary)" opacity={0.8} />
          </div>
          <h3 className="mb-3" style={{ fontSize: '1.75rem' }}>No Recommendations Yet</h3>
          <p className="text-muted max-w-md mx-auto mb-8" style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
            You haven't generated any personalized university pathways yet. Click the button below to let our system analyze your profile and find your perfect degree match!
          </p>
          <button onClick={handleGenerate} className="btn btn-primary" disabled={generating} style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', gap: '0.75rem', display: 'flex', alignItems: 'center' }}>
            <Zap size={20} />
            <span>Generate Your Pathways Now</span>
          </button>
        </div>
      )}

      {/* Results State */}
      {!loading && !generating && recommendations.length > 0 && (
        <div className="flex flex-col relative" style={{ gap: '1.5rem' }}>
          {recommendations.map((rec, idx) => {
            const isState = rec.type === 'State';
            
            return (
              <div key={idx} className="glass-panel relative overflow-hidden" style={{ padding: '2rem', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: isState ? 'var(--color-primary)' : 'var(--color-secondary)' }}></div>
                
                <div className="flex justify-between items-start" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div className="flex items-center" style={{ gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                      <h2 style={{ margin: 0, fontSize: '1.5rem', color: isState ? '#a5b4fc' : '#e9d5ff' }}>{rec.name || 'Unknown Degree'}</h2>
                      <span className={`badge ${isState ? 'badge-primary' : 'badge-warning'}`} style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                        {isState ? 'State University' : 'Private Institute'}
                      </span>
                    </div>
                    <div className="flex items-center text-muted" style={{ gap: '0.5rem', fontSize: '1.05rem' }}>
                      <Building2 size={18} />
                      <span>{rec.university || 'Unknown University'}</span>
                    </div>
                  </div>
                  
                  <div className="text-right flex items-center" style={{ gap: '1rem' }}>
                    <div className="text-muted" style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Match Score</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-success)', lineHeight: 1 }}>
                      {Math.min(100, Math.round((rec.score / 17) * 100))}%
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h4 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}><BookOpen size={18} color="var(--color-primary-light)" /> Why this matches you:</h4>
                  <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>{rec.reason || 'Based on your academic profile and preferences.'}</p>
                </div>

                <div className="flex" style={{ gap: '1rem', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => goToSkillGap(recommendationId, rec.careers?.[0])} 
                    className="btn btn-outline flex-1"
                    style={{ padding: '0.875rem', justifyContent: 'center', borderColor: 'rgba(255,255,255,0.2)' }}
                    disabled={!rec.careers || rec.careers.length === 0}
                  >
                    {rec.careers && rec.careers.length > 0 ? 'Analyze Skill Gap' : 'No Skills Mapped'}
                  </button>
                  <button 
                    onClick={() => navigate('/roadmap', { state: { recommendationId, targetCareerId: rec.careers?.[0] } })} 
                    className="btn btn-outline flex-1"
                    style={{ padding: '0.875rem', justifyContent: 'center', borderColor: 'rgba(255,255,255,0.2)' }}
                    disabled={!rec.careers || rec.careers.length === 0}
                  >
                    {rec.careers && rec.careers.length > 0 ? 'View Learning Roadmap' : 'No Roadmap Mapped'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
