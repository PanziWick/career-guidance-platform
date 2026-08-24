import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { Save, Plus, Trash2 } from 'lucide-react';

const AcademicProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState(null);
  
  const [interestsList] = useState(['Writing', 'Public Speaking', 'Research', 'Art', 'Design', 'History']);
  const [skillsList] = useState(['Communication', 'Critical Thinking', 'Creativity', 'Leadership']);
  const [careersList] = useState(['Journalist', 'Teacher', 'Lawyer', 'Graphic Designer', 'Psychologist']);

  const [interestInput, setInterestInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [careerInput, setCareerInput] = useState('');

  // We need combinations list to map subjectCombinationId if they use it.
  const [combinations, setCombinations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, combosRes] = await Promise.all([
          apiClient.get('/academic-profile/me'),
          apiClient.get('/subject-combinations?stream=Arts')
        ]);
        
        const data = profileRes.data.profile;
        // Ensure arrays exist
        data.olResults = data.olResults || [];
        data.alResults = data.alResults || [];
        data.interests = data.interests || [];
        data.existingSkills = data.existingSkills || [];
        data.careerPreferences = data.careerPreferences || [];
        
        setProfile(data);
        setCombinations(combosRes.data || []);
      } catch (err) {
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      // The backend allows updating specific fields.
      const updates = {
        olResults: profile.olResults,
        alResults: profile.alResults,
        interests: profile.interests,
        existingSkills: profile.existingSkills,
        careerPreferences: profile.careerPreferences,
        subjectCombinationId: profile.subjectCombinationId || undefined
      };
      
      const res = await apiClient.put('/academic-profile/me', updates);
      setProfile(res.data.profile);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const addOlResult = () => {
    setProfile({ ...profile, olResults: [...profile.olResults, { subject: '', grade: 'C' }] });
  };

  const removeOlResult = (index) => {
    const updated = [...profile.olResults];
    updated.splice(index, 1);
    setProfile({ ...profile, olResults: updated });
  };

  const addAlResult = () => {
    setProfile({ ...profile, alResults: [...profile.alResults, { subject: '', grade: 'C' }] });
  };

  const removeAlResult = (index) => {
    const updated = [...profile.alResults];
    updated.splice(index, 1);
    setProfile({ ...profile, alResults: updated });
  };

  if (loading) return <div className="loading-spinner">Loading profile...</div>;

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1>Academic Profile</h1>
          <p className="text-muted">Manage your educational background and preferences</p>
        </div>
        <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
          <Save size={18} />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="badge badge-success mb-6 p-4 w-full" style={{ display: 'block', fontSize: '1rem' }}>{success}</div>}

      <div className="flex flex-col gap-6">
        
        {/* O/L Results */}
        <div className="glass-panel">
          <div className="flex justify-between items-center mb-4">
            <h3>O/L Results</h3>
            <button type="button" onClick={addOlResult} className="btn btn-outline" style={{ padding: '0.5rem', fontSize: '0.875rem' }}>
              <Plus size={16} /> Add Subject
            </button>
          </div>
          {profile.olResults.length === 0 && <p className="text-muted">No O/L results added yet.</p>}
          <div className="flex flex-col gap-3">
            {profile.olResults.map((result, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <input 
                  type="text" 
                  placeholder="Subject (e.g. Mathematics)" 
                  className="form-input flex-1"
                  value={result.subject}
                  onChange={e => {
                    const updated = [...profile.olResults];
                    updated[idx].subject = e.target.value;
                    setProfile({ ...profile, olResults: updated });
                  }}
                />
                <select 
                  className="form-select" 
                  style={{ width: '100px' }}
                  value={result.grade}
                  onChange={e => {
                    const updated = [...profile.olResults];
                    updated[idx].grade = e.target.value;
                    setProfile({ ...profile, olResults: updated });
                  }}
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="S">S</option>
                  <option value="F">F</option>
                </select>
                <button type="button" onClick={() => removeOlResult(idx)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}>
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* A/L Results */}
        <div className="glass-panel">
          <div className="flex justify-between items-center mb-4">
            <h3>A/L Results (Arts Stream)</h3>
            <button type="button" onClick={addAlResult} className="btn btn-outline" style={{ padding: '0.5rem', fontSize: '0.875rem' }}>
              <Plus size={16} /> Add Subject
            </button>
          </div>
          
          <div className="form-group mb-4">
            <label className="form-label">Subject Combination</label>
            <select 
              className="form-select"
              value={profile.subjectCombinationId || ''}
              onChange={e => setProfile({ ...profile, subjectCombinationId: e.target.value })}
            >
              <option value="">-- Select Combination --</option>
              {combinations.map(c => (
                <option key={c._id} value={c._id}>
                  {c.combinationId} - {c.subject1}, {c.subject2}, {c.subject3}
                </option>
              ))}
            </select>
            <p className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>Required to validate your A/L subjects for state university admission.</p>
          </div>

          {profile.alResults.length === 0 && <p className="text-muted">No A/L results added yet.</p>}
          <div className="flex flex-col gap-3">
            {profile.alResults.map((result, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <input 
                  type="text" 
                  placeholder="Subject (e.g. Logic)" 
                  className="form-input flex-1"
                  value={result.subject}
                  onChange={e => {
                    const updated = [...profile.alResults];
                    updated[idx].subject = e.target.value;
                    setProfile({ ...profile, alResults: updated });
                  }}
                />
                <select 
                  className="form-select" 
                  style={{ width: '100px' }}
                  value={result.grade}
                  onChange={e => {
                    const updated = [...profile.alResults];
                    updated[idx].grade = e.target.value;
                    setProfile({ ...profile, alResults: updated });
                  }}
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="S">S</option>
                  <option value="F">F</option>
                </select>
                <button type="button" onClick={() => removeAlResult(idx)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}>
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Guidance Inputs */}
        <div className="glass-panel flex flex-col gap-6">
          <h3>Guidance Inputs</h3>
          
          <div className="form-group mb-0">
            <label className="form-label">Interests</label>
            <div className="flex gap-2 mb-2" style={{ flexWrap: 'wrap' }}>
              {profile.interests.map(interest => (
                <span key={interest} className="badge badge-primary flex items-center gap-1">
                  {interest}
                  <button type="button" onClick={() => setProfile({ ...profile, interests: profile.interests.filter(i => i !== interest) })} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex', marginLeft: '4px' }}>
                    <Trash2 size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Type an interest and press Enter or Add" 
                className="form-input flex-1"
                value={interestInput}
                onChange={e => setInterestInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && interestInput.trim()) {
                    e.preventDefault();
                    if (!profile.interests.includes(interestInput.trim())) {
                      setProfile({ ...profile, interests: [...profile.interests, interestInput.trim()] });
                    }
                    setInterestInput('');
                  }
                }}
              />
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={() => {
                  if (interestInput.trim() && !profile.interests.includes(interestInput.trim())) {
                    setProfile({ ...profile, interests: [...profile.interests, interestInput.trim()] });
                  }
                  setInterestInput('');
                }}
              >
                Add
              </button>
            </div>
            <div className="mt-2 text-muted" style={{ fontSize: '0.75rem' }}>
              Suggestions: {interestsList.filter(i => !profile.interests.includes(i)).map(i => (
                <span key={i} style={{ cursor: 'pointer', marginRight: '8px', textDecoration: 'underline' }} onClick={() => setProfile({ ...profile, interests: [...profile.interests, i] })}>{i}</span>
              ))}
            </div>
          </div>

          <div className="form-group mb-0">
            <label className="form-label">Existing Skills</label>
            <div className="flex gap-2 mb-2" style={{ flexWrap: 'wrap' }}>
              {profile.existingSkills.map(skill => (
                <span key={skill} className="badge badge-primary flex items-center gap-1">
                  {skill}
                  <button type="button" onClick={() => setProfile({ ...profile, existingSkills: profile.existingSkills.filter(s => s !== skill) })} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex', marginLeft: '4px' }}>
                    <Trash2 size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Type a skill and press Enter or Add" 
                className="form-input flex-1"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && skillInput.trim()) {
                    e.preventDefault();
                    if (!profile.existingSkills.includes(skillInput.trim())) {
                      setProfile({ ...profile, existingSkills: [...profile.existingSkills, skillInput.trim()] });
                    }
                    setSkillInput('');
                  }
                }}
              />
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={() => {
                  if (skillInput.trim() && !profile.existingSkills.includes(skillInput.trim())) {
                    setProfile({ ...profile, existingSkills: [...profile.existingSkills, skillInput.trim()] });
                  }
                  setSkillInput('');
                }}
              >
                Add
              </button>
            </div>
            <div className="mt-2 text-muted" style={{ fontSize: '0.75rem' }}>
              Suggestions: {skillsList.filter(s => !profile.existingSkills.includes(s)).map(s => (
                <span key={s} style={{ cursor: 'pointer', marginRight: '8px', textDecoration: 'underline' }} onClick={() => setProfile({ ...profile, existingSkills: [...profile.existingSkills, s] })}>{s}</span>
              ))}
            </div>
          </div>

          <div className="form-group mb-0">
            <label className="form-label">Career Preferences</label>
            <div className="flex gap-2 mb-2" style={{ flexWrap: 'wrap' }}>
              {profile.careerPreferences.map(career => (
                <span key={career} className="badge badge-primary flex items-center gap-1">
                  {career}
                  <button type="button" onClick={() => setProfile({ ...profile, careerPreferences: profile.careerPreferences.filter(c => c !== career) })} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex', marginLeft: '4px' }}>
                    <Trash2 size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Type a career and press Enter or Add" 
                className="form-input flex-1"
                value={careerInput}
                onChange={e => setCareerInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && careerInput.trim()) {
                    e.preventDefault();
                    if (!profile.careerPreferences.includes(careerInput.trim())) {
                      setProfile({ ...profile, careerPreferences: [...profile.careerPreferences, careerInput.trim()] });
                    }
                    setCareerInput('');
                  }
                }}
              />
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={() => {
                  if (careerInput.trim() && !profile.careerPreferences.includes(careerInput.trim())) {
                    setProfile({ ...profile, careerPreferences: [...profile.careerPreferences, careerInput.trim()] });
                  }
                  setCareerInput('');
                }}
              >
                Add
              </button>
            </div>
            <div className="mt-2 text-muted" style={{ fontSize: '0.75rem' }}>
              Suggestions: {careersList.filter(c => !profile.careerPreferences.includes(c)).map(c => (
                <span key={c} style={{ cursor: 'pointer', marginRight: '8px', textDecoration: 'underline' }} onClick={() => setProfile({ ...profile, careerPreferences: [...profile.careerPreferences, c] })}>{c}</span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AcademicProfile;
