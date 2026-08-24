import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Map as MapIcon, Flag, Book, AlertCircle, ExternalLink } from 'lucide-react';

const Roadmap = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roadmapData, setRoadmapData] = useState(null);
  
  const [history, setHistory] = useState([]);
  const [selectedRecId, setSelectedRecId] = useState('');

  useEffect(() => {
    const init = async () => {
      if (location.state?.recommendationId) {
        setSelectedRecId(location.state.recommendationId);
        generateRoadmap(location.state.recommendationId, location.state.targetCareerId);
      } else {
        // Fetch recommendations to let user choose
        try {
          const res = await apiClient.get('/recommendations');
          if (res.data && res.data.length > 0) {
            setHistory(res.data);
          }
        } catch (err) {
          setError('Failed to load pathways.');
        }
      }
    };
    init();
  }, [location.state]);

  const generateRoadmap = async (recId, careerId) => {
    try {
      setLoading(true);
      setError('');
      setRoadmapData(null);
      
      const res = await apiClient.post('/roadmaps', {
        recommendationId: recId,
        targetCareerId: careerId
      });
      
      setRoadmapData(res.data.roadmap);
    } catch (err) {
      setError(err.message || 'Failed to generate roadmap.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (e) => {
    const val = e.target.value;
    setSelectedRecId(val);
    if (val) {
      generateRoadmap(val, null);
    } else {
      setRoadmapData(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1>Learning Roadmap</h1>
        <p className="text-muted">Your step-by-step guide to acquiring missing skills</p>
      </div>

      {!location.state?.recommendationId && (
        <div className="glass-panel mb-6">
          <label className="form-label">Select a recommended pathway</label>
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
      {loading && <div className="loading-spinner">Mapping your journey...</div>}

      {roadmapData && !loading && (
        <div className="flex flex-col gap-6">
          
          <div className="glass-panel flex items-center justify-between">
            <div>
              <h2 className="mb-1">{roadmapData.targetPathway || 'Selected Pathway'}</h2>
              <p className="text-muted">Target Career: {roadmapData.targetCareer?.name || 'Not specified'}</p>
            </div>
            <div className="text-right">
              <MapIcon size={48} color="var(--color-primary-light)" />
            </div>
          </div>

          <div className="glass-panel">
            <h3 className="mb-6 flex items-center gap-2"><Flag size={20} /> Milestones</h3>
            
            {roadmapData.milestones?.length > 0 ? (
              <div className="flex flex-col gap-4">
                {roadmapData.milestones.map((milestone, idx) => (
                  <div key={idx} className="p-4" style={{ background: 'rgba(0,0,0,0.2)', borderLeft: '4px solid var(--color-primary-light)', borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}>
                    <h4 className="mb-2 text-gradient">{milestone.title || `Milestone ${idx + 1}`}</h4>
                    <p className="text-muted mb-4" style={{ fontSize: '0.875rem' }}>{milestone.description}</p>
                    
                    {milestone.unavailableResources ? (
                      <div className="flex items-start gap-2" style={{ color: 'var(--color-warning)', fontSize: '0.875rem' }}>
                        <AlertCircle size={16} style={{ marginTop: '2px' }} />
                        <span>No verified learning resource is currently mapped for this skill.</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 mt-2">
                        <strong style={{ fontSize: '0.875rem' }} className="flex items-center gap-2">
                          <Book size={14} /> Recommended Resources:
                        </strong>
                        {milestone.resources?.map((res, ridx) => (
                          <div key={ridx} className="flex flex-col p-3 rounded" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div className="flex items-center justify-between mb-1">
                              <a href={res.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-medium" style={{ color: 'var(--color-primary-light)', textDecoration: 'none' }}>
                                {res.title} <ExternalLink size={14} />
                              </a>
                              <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(255,255,255,0.1)' }}>{res.provider}</span>
                            </div>
                            <div className="flex gap-3 text-xs text-muted">
                              {res.type && <span>Type: {res.type}</span>}
                              {res.level && <span>Level: {res.level}</span>}
                              {res.access && <span>Access: {res.access}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">You have no missing skills for this pathway. You're ready to go!</p>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default Roadmap;
