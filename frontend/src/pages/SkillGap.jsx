import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Target, CheckCircle, XCircle, AlertCircle, Search, ArrowRight } from 'lucide-react';

const SkillGap = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gapData, setGapData] = useState(null);

  // Allow selecting a recommendation if we navigated here without one
  const [history, setHistory] = useState([]);
  const [selectedRecId, setSelectedRecId] = useState('');

  useEffect(() => {
    const init = async () => {
      // If we received state from router, run analysis
      if (location.state?.recommendationId) {
        setSelectedRecId(location.state.recommendationId);
        runAnalysis(location.state.recommendationId, location.state.targetCareerId);
      } else {
        // Fetch history to let user choose
        try {
          const res = await apiClient.get('/recommendations');
          if (res.data && res.data.length > 0) {
            setHistory(res.data);
          }
        } catch (err) {
          setError('Failed to load recommendations.');
        }
      }
    };
    init();
  }, [location.state]);

  const runAnalysis = async (recId, careerId) => {
    try {
      setLoading(true);
      setError('');
      setGapData(null);
      const res = await apiClient.post('/skills/gap-analysis', {
        recommendationId: recId,
        targetCareerId: careerId
      });
      setGapData(res.data.gapAnalysis);
    } catch (err) {
      setError(err.message || 'Failed to analyze skill gap.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (e) => {
    const val = e.target.value;
    setSelectedRecId(val);
    if (val) {
      runAnalysis(val, null); // Will pick default career if targetCareerId not specified
    } else {
      setGapData(null);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Premium Hero Header */}
      <div className="glass-panel mb-8 border-none flex items-center gap-6" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(30, 30, 45, 0.8) 100%)', padding: '2rem' }}>
        <div style={{ background: 'var(--color-danger)', padding: '1rem', borderRadius: '50%', boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)' }}>
          <Target size={40} color="white" />
        </div>
        <div>
          <h1 style={{ marginBottom: '0.5rem', fontSize: '2.5rem', background: 'linear-gradient(to right, #fff, #fca5a5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Skill Gap Analysis
          </h1>
          <p className="text-muted" style={{ fontSize: '1.1rem' }}>Identify exactly what skills you need to reach your target career.</p>
        </div>
      </div>

      {!location.state?.recommendationId && (
        <div className="glass-panel mb-6 flex items-center gap-4">
          <div className="flex-1">
            <label className="form-label mb-2" style={{ fontWeight: 600 }}>Select a recommended pathway to analyze</label>
            <select className="form-select w-full" value={selectedRecId} onChange={handleSelectChange} style={{ fontSize: '1.05rem', padding: '0.85rem 1rem', background: '#1e1e2d', color: '#fff', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '0.5rem', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <option value="" style={{ background: '#1e1e2d', color: '#fff' }}>-- Choose a previously generated pathway --</option>
              {history.map(rec => (
                <option key={rec._id} value={rec._id} style={{ background: '#1e1e2d', color: '#fff' }}>
                  Pathway generated on {new Date(rec.generatedAt).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {error && <div className="alert-error mb-6">{error}</div>}

      {/* Empty State / Placeholder */}
      {!gapData && !loading && !error && (
        <div className="glass-panel flex flex-col items-center justify-center text-center" style={{ padding: '4rem 2rem', minHeight: '400px' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '2rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <Search size={64} color="var(--color-danger)" opacity={0.8} />
          </div>
          <h3 className="mb-2" style={{ fontSize: '1.5rem' }}>Analyze Your Skill Gaps</h3>
          <p className="text-muted max-w-md mx-auto mb-6">
            Select a career pathway from the dropdown above to see how your current skills stack up against industry requirements.
          </p>
        </div>
      )}

      {loading && (
        <div className="glass-panel flex flex-col items-center justify-center text-center" style={{ padding: '4rem 2rem', minHeight: '400px' }}>
           <div className="loading-spinner mb-4"></div>
           <p className="text-muted">Running deep analysis on your skill sets...</p>
        </div>
      )}

      {gapData && !loading && (
        <div className="flex flex-col gap-6 animate-fade-in">
          <div className="glass-panel flex items-center justify-between" style={{ borderLeft: '4px solid var(--color-primary-light)' }}>
            <div>
              <p className="text-muted mb-1 text-sm uppercase tracking-wider">Target Career Pathway</p>
              <h2 className="mb-0" style={{ fontSize: '1.75rem' }}>{gapData.targetCareer?.name || 'Target Career'}</h2>
            </div>
            <div className="text-right flex items-center gap-4">
              <div className="text-right">
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-primary-light)', lineHeight: 1 }}>
                  {gapData.completionPercentage}%
                </div>
                <p className="text-muted text-sm mt-1">Skill Match Score</p>
              </div>
            </div>
          </div>

          {gapData.unavailableMapping && (
            <div className="alert-error flex items-start gap-3">
              <AlertCircle size={24} style={{ flexShrink: 0 }} />
              <div>
                <strong className="block mb-1">Mapping Unavailable</strong>
                <p>The backend does not have complete skill requirements mapped for this specific career yet. Showing generalized results.</p>
              </div>
            </div>
          )}

          <div className="flex gap-6" style={{ flexWrap: 'wrap' }}>
            {/* Matched Skills Box */}
            <div className="glass-panel flex-1 min-w-[300px]" style={{ borderTop: '4px solid var(--color-success)' }}>
              <h3 className="mb-4 flex items-center gap-2" style={{ color: 'var(--color-success)' }}>
                <CheckCircle size={24} /> Verified Skills
              </h3>
              {gapData.matchedSkills?.length > 0 ? (
                <div className="flex flex-col" style={{ gap: '0.75rem' }}>
                  {gapData.matchedSkills.map((skill, idx) => (
                    <div key={idx} className="flex items-center rounded-md" style={{ gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.15)' }}>
                      <CheckCircle size={18} color="var(--color-success)" style={{ flexShrink: 0 }} />
                      <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{skill.name || skill}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-md text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <p className="text-muted">No matching skills identified for this specific career.</p>
                </div>
              )}
            </div>

            {/* Missing Skills Box */}
            <div className="glass-panel flex-1 min-w-[300px]" style={{ borderTop: '4px solid var(--color-warning)' }}>
              <h3 className="mb-4 flex items-center gap-2" style={{ color: 'var(--color-warning)' }}>
                <XCircle size={24} /> Missing Skills to Develop
              </h3>
              {gapData.missingSkills?.length > 0 ? (
                <div className="flex flex-col" style={{ gap: '0.75rem' }}>
                  {gapData.missingSkills.map((skill, idx) => (
                    <div key={idx} className="flex items-center rounded-md" style={{ gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                      <XCircle size={18} color="var(--color-warning)" style={{ flexShrink: 0 }} />
                      <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{skill.name || skill}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-md text-center" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                  <p style={{ color: 'var(--color-success)', fontWeight: 500 }}>Incredible! You already have all the required core skills.</p>
                </div>
              )}
            </div>
          </div>

          {gapData.missingSkills?.length > 0 && (
            <div className="mt-4 flex justify-end">
               <button 
                className="btn btn-primary flex items-center justify-center"
                style={{ padding: '0.875rem 1.5rem', fontSize: '1.05rem', gap: '0.5rem' }}
                onClick={() => navigate('/roadmap', { state: { recommendationId: selectedRecId } })}
              >
                <span>Generate Learning Roadmap</span>
                <ArrowRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SkillGap;
