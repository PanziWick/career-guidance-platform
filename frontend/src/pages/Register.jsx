import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center" style={{ minHeight: '100vh', background: 'var(--color-bg-base)', padding: '2rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '450px' }}>
        <div className="mb-6 text-center">
          <h2 className="text-gradient">Create Account</h2>
          <p className="text-muted">Start your higher education pathway journey</p>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="flex gap-4 mb-4">
            <div className="w-full">
              <label className="form-label" htmlFor="firstName">First Name</label>
              <input type="text" id="firstName" className="form-input" value={formData.firstName} onChange={handleChange} required />
            </div>
            <div className="w-full">
              <label className="form-label" htmlFor="lastName">Last Name</label>
              <input type="text" id="lastName" className="form-input" value={formData.lastName} onChange={handleChange} required />
            </div>
          </div>
          
          <div className="form-group mb-4">
            <label className="form-label" htmlFor="email">Email</label>
            <input type="email" id="email" className="form-input" value={formData.email} onChange={handleChange} required />
          </div>
          
          <div className="form-group mb-6">
            <label className="form-label" htmlFor="password">Password (Min. 6 chars)</label>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                className="form-input" 
                style={{ paddingRight: '2.5rem' }}
                value={formData.password} 
                onChange={handleChange} 
                required 
                minLength={6} 
              />
              <button 
                type="button" 
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Creating Account...' : (
              <>
                <UserPlus size={18} />
                <span>Register</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--color-primary-light)', textDecoration: 'none' }}>Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
