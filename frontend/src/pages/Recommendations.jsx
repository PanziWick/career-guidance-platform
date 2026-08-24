import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { Zap, Clock, Award, Building2, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Recommendations = () => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationId, setRecommendationId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/recommendations');
      // The backend returns history which is a list of recommendation documents.
      // Usually the most recent is what we want, or we can just show the list.
      // Let's assume `res.data` is an array of generation history. 
      // We'll flatten the results to display them.
      if (res.data && res.data.length > 0) {
        // Just take the most recent generated batch for simplicity
        setRecommendationId(res.data[0]._id);
        setRecommendations(res.data[0].results || []);
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
    }
  };

  const goToSkillGap = (recId, targetCareerId) => {
    navigate('/skill-gap', { state: { recommendationId: recId, targetCareerId } });
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Your Recommendations</h1>
          <p className="text-muted">Personalized degree pathways based on your profile</p>
        </div>
        <button onClick={handleGenerate} className="btn btn-primary" disabled={generating}>
          <Zap size={18} />
          <span>{generating ? 'Analyzing...' : 'Generate New Options'}</span>
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="loading-spinner">Loading history...</div>
      ) : recommendations.length === 0 ? (
        <div className="glass-panel text-center py-12">
          <Award size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 className="mb-2">No Recommendations Yet</h3>
          <p className="text-muted mb-6">Generate your first set of recommendations to see pathways.</p>
          <button onClick={handleGenerate} className="btn btn-outline" disabled={generating}>
            Generate Now
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {recommendations.map((rec, idx) => {
            const isState = rec.type === 'State';
            
            return (
              <div key={idx} className="glass-panel relative overflow-hidden">
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: isState ? 'var(--color-primary)' : 'var(--color-secondary)' }}></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 style={{ margin: 0 }}>{rec.name || 'Unknown Degree'}</h2>
                      <span className={`badge ${isState ? 'badge-primary' : 'badge-warning'}`}>
                        {isState ? 'State University' : 'Private Institute'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted">
                      <Building2 size={16} />
                      <span>{rec.university || 'Unknown University'}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-success)' }}>
                      {Math.min(100, Math.round((rec.score / 17) * 100))}%
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.875rem' }}>Match Score</div>
                  </div>
                </div>

                <div className="mb-4 p-4" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                  <h4 className="mb-2 flex items-center gap-2"><BookOpen size={16} /> Why this matches you:</h4>
                  <p className="text-muted" style={{ fontSize: '0.875rem' }}>{rec.reason || 'Based on your academic profile and preferences.'}</p>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => goToSkillGap(recommendationId, rec.careers?.[0])} 
                    className="btn btn-outline flex-1"
                    disabled={!rec.careers || rec.careers.length === 0}
                  >
                    {rec.careers && rec.careers.length > 0 ? 'Analyze Skill Gap' : 'No Skills Mapped'}
                  </button>
                  <button 
                    onClick={() => navigate('/roadmap', { state: { recommendationId, targetCareerId: rec.careers?.[0] } })} 
                    className="btn btn-outline flex-1"
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
