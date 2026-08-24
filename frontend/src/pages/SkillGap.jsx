import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Target, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

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
      <div className="mb-6">
        <h1>Skill Gap Analysis</h1>
        <p className="text-muted">Discover what skills you need to reach your target career</p>
      </div>

      {!location.state?.recommendationId && (
        <div className="glass-panel mb-6">
          <label className="form-label">Select a recommended pathway to analyze</label>
          <select className="form-select" value={selectedRecId} onChange={handleSelectChange}>
            <option value="">-- Select Pathway --</option>
            {history.map(rec => (
              <option key={rec._id} value={rec._id}>
                Generated on {new Date(rec.generatedAt).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && <div className="alert-error">{error}</div>}

      {loading && <div className="loading-spinner">Analyzing skills...</div>}

      {gapData && !loading && (
        <div className="flex flex-col gap-6">
          <div className="glass-panel flex items-center justify-between">
            <div>
              <h2 className="mb-1">{gapData.targetCareer?.name || 'Target Career'}</h2>
              <p className="text-muted">Target Career Pathway</p>
            </div>
            <div className="text-right">
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-primary-light)' }}>
                {gapData.matchPercentage}%
              </div>
              <p className="text-muted text-sm">Skill Match</p>
            </div>
          </div>

          {gapData.unavailableMapping && (
            <div className="alert-error flex items-start gap-3">
              <AlertCircle size={24} />
              <div>
                <strong className="block mb-1">Mapping Unavailable</strong>
                <p>The backend does not have complete skill requirements mapped for this specific career yet.</p>
              </div>
            </div>
          )}

          <div className="flex gap-6" style={{ flexWrap: 'wrap' }}>
            <div className="glass-panel flex-1 min-w-[300px]">
              <h3 className="mb-4 flex items-center gap-2" style={{ color: 'var(--color-success)' }}>
                <CheckCircle size={20} /> Matched Skills
              </h3>
              {gapData.matchedSkills?.length > 0 ? (
                <ul style={{ listStyle: 'none' }}>
                  {gapData.matchedSkills.map((skill, idx) => (
                    <li key={idx} className="mb-2 pb-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                      {skill.name || skill}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No matching skills identified.</p>
              )}
            </div>

            <div className="glass-panel flex-1 min-w-[300px]">
              <h3 className="mb-4 flex items-center gap-2" style={{ color: 'var(--color-warning)' }}>
                <XCircle size={20} /> Missing Skills
              </h3>
              {gapData.missingSkills?.length > 0 ? (
                <ul style={{ listStyle: 'none' }}>
                  {gapData.missingSkills.map((skill, idx) => (
                    <li key={idx} className="mb-2 pb-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                      {skill.name || skill}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">You have all the required skills!</p>
              )}
            </div>
          </div>

          {gapData.missingSkills?.length > 0 && (
            <div className="mt-4">
               <button 
                className="btn btn-primary w-full"
                onClick={() => navigate('/roadmap', { state: { recommendationId: selectedRecId } })}
              >
                Generate Learning Roadmap
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SkillGap;
