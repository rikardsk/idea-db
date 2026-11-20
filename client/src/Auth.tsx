import React, { useState } from 'react';
import { supabase } from './supabase';
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

interface AuthProps {
  onSkip?: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onSkip }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container fade-in">
      <div className="auth-card glass">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-icon">🚀</div>
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to manage your ideas</p>
        </div>

        <form onSubmit={handleAuth} className="auth-form">
          {error && (
            <div className="auth-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <LogIn size={20} /> Sign In
              </>
            )}
          </button>
        </form>

        {onSkip && (
          <div className="auth-footer" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
            </div>
            <button
              type="button"
              className="btn btn-outline"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={onSkip}
            >
              Skip for now (Use Local Database)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
