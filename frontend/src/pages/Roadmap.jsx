import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Map as MapIcon, Flag, Book, AlertCircle, ExternalLink, Compass, ArrowRight } from 'lucide-react';

const Roadmap = () => {
  const location = useLocation();
  const navigate = useNavigate();
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
      {/* Premium Hero Header */}
      <div className="glass-panel mb-8 border-none flex items-center gap-6" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(30, 30, 45, 0.8) 100%)', padding: '2rem' }}>
        <div style={{ background: 'var(--color-success)', padding: '1rem', borderRadius: '50%', boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)' }}>
          <MapIcon size={40} color="white" />
        </div>
        <div>
          <h1 style={{ marginBottom: '0.5rem', fontSize: '2.5rem', background: 'linear-gradient(to right, #fff, #86efac)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Learning Roadmap
          </h1>
          <p className="text-muted" style={{ fontSize: '1.1rem' }}>Your customized step-by-step guide to mastering the required skills.</p>
        </div>
      </div>

      {!location.state?.recommendationId && (
        <div className="glass-panel mb-6 flex items-center gap-4">
          <div className="flex-1">
            <label className="form-label mb-2" style={{ fontWeight: 600 }}>Select a recommended pathway to map</label>
            <select className="form-select w-full" value={selectedRecId} onChange={handleSelectChange} style={{ fontSize: '1.05rem', padding: '0.85rem 1rem', background: '#1e1e2d', color: '#fff', border: '1px solid rgba(34, 197, 94, 0.4)', borderRadius: '0.5rem', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
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
      {!roadmapData && !loading && !error && (
        <div className="glass-panel flex flex-col items-center justify-center text-center" style={{ padding: '4rem 2rem', minHeight: '400px' }}>
          <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '2rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <Compass size={64} color="var(--color-success)" opacity={0.8} />
          </div>
          <h3 className="mb-2" style={{ fontSize: '1.5rem' }}>Chart Your Career Journey</h3>
          <p className="text-muted max-w-md mx-auto mb-6">
            Select a career pathway from the dropdown above to generate a personalized timeline of courses, certifications, and milestones required to land your dream job.
          </p>
        </div>
      )}

      {loading && (
        <div className="glass-panel flex flex-col items-center justify-center text-center" style={{ padding: '4rem 2rem', minHeight: '400px' }}>
           <div className="loading-spinner mb-4"></div>
           <p className="text-muted">Calculating the optimal learning path for you...</p>
        </div>
      )}

      {roadmapData && !loading && (
        <div className="flex flex-col gap-6 animate-fade-in">
          
          <div className="glass-panel flex items-center justify-between" style={{ borderLeft: '4px solid var(--color-success)' }}>
            <div>
              <p className="text-muted mb-1 text-sm uppercase tracking-wider">Your Destination</p>
              <h2 className="mb-1" style={{ fontSize: '1.75rem' }}>{roadmapData.targetCareer?.name || 'Target Career'}</h2>
              <p className="text-muted mb-0" style={{ display: 'inline-block', background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem' }}>
                Pathway: {roadmapData.targetPathway || 'Selected Pathway'}
              </p>
            </div>
            <div className="text-right">
              <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                <Flag size={32} color="var(--color-success)" />
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2.5rem 2rem' }}>
            <h3 className="mb-8 flex items-center gap-3 text-2xl border-b pb-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <Compass size={28} color="var(--color-primary-light)" /> 
              Journey Milestones
            </h3>
            
            {roadmapData.milestones?.length > 0 ? (
              <div className="flex flex-col relative" style={{ gap: '1.5rem' }}>
                {/* Vertical Timeline Line */}
                <div style={{ position: 'absolute', left: '23px', top: '10px', bottom: '20px', width: '2px', background: 'rgba(255,255,255,0.1)' }}></div>

                {roadmapData.milestones.map((milestone, idx) => (
                  <div key={idx} className="flex relative z-10" style={{ gap: '1.5rem' }}>
                    <div style={{ flexShrink: 0, width: '48px', height: '48px', background: 'var(--bg-card, #1e1e2d)', border: '2px solid var(--color-primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-light)', fontWeight: 'bold', zIndex: 2 }}>
                      {idx + 1}
                    </div>
                    
                    <div className="flex-1 rounded-lg" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                      <h4 style={{ marginBottom: '0.5rem', fontSize: '1.15rem', color: '#a5b4fc', fontWeight: 600 }}>{milestone.title || `Milestone ${idx + 1}`}</h4>
                      <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.95rem', lineHeight: 1.6 }}>{milestone.description}</p>
                      
                      {milestone.unavailableResources ? (
                        <div className="flex items-start rounded-md" style={{ gap: '0.5rem', padding: '0.75rem', background: 'rgba(245, 158, 11, 0.05)', color: 'var(--color-warning)', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span style={{ fontSize: '0.9rem' }}>No verified learning resources are currently mapped for this specific skill.</span>
                        </div>
                      ) : (
                        <div className="flex flex-col mt-4" style={{ gap: '0.75rem' }}>
                          <strong style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="text-muted">
                            <Book size={16} /> Recommended Resources
                          </strong>
                          <div className="grid" style={{ gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                            {milestone.resources?.map((res, ridx) => (
                              <a 
                                key={ridx} 
                                href={res.url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="flex flex-col rounded-md" 
                                style={{ padding: '1.25rem', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)', textDecoration: 'none', transition: 'all 0.2s ease', cursor: 'pointer' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)'; e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)'; }}
                              >
                                <div className="flex items-start justify-between" style={{ marginBottom: '0.75rem', gap: '1rem' }}>
                                  <span style={{ fontWeight: 600, color: '#fff', lineHeight: 1.3, fontSize: '1.05rem' }}>
                                    {res.title}
                                  </span>
                                  <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}>
                                    <ExternalLink size={16} color="#a5b4fc" />
                                  </div>
                                </div>
                                <div className="flex flex-wrap text-muted" style={{ gap: '0.5rem', fontSize: '0.8rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                                  <span style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', background: 'rgba(255,255,255,0.1)', color: '#fff' }}>{res.provider}</span>
                                  {res.type && <span style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: '1px solid rgba(255,255,255,0.1)' }}>{res.type}</span>}
                                  {res.level && <span style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: '1px solid rgba(255,255,255,0.1)' }}>{res.level}</span>}
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-lg" style={{ background: 'rgba(34, 197, 94, 0.05)', border: '1px dashed var(--color-success)' }}>
                <CheckCircle size={48} color="var(--color-success)" style={{ margin: '0 auto 1rem' }} />
                <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Missing Skills!</h4>
                <p className="text-muted mb-0">You already possess all the required skills for this pathway. You're ready to start applying!</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default Roadmap;
