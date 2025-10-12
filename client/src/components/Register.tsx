import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import type { RegisterCredentials } from '../types/user';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const { register, loading } = useAuth();
  const { theme } = useTheme();
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (credentials.password !== credentials.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (credentials.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      await register(credentials);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '0 auto',
      padding: '32px 24px',
      backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{
        textAlign: 'center',
        marginBottom: '24px',
        color: theme === 'dark' ? '#f9fafb' : '#111827',
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        Create Account
      </h2>

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#dc2626',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: theme === 'dark' ? '#d1d5db' : '#374151',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={credentials.name}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
              borderRadius: '8px',
              backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
              color: theme === 'dark' ? '#f9fafb' : '#111827',
              fontSize: '16px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            placeholder="Enter your full name"
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: theme === 'dark' ? '#d1d5db' : '#374151',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Email
          </label>
          <input
            type="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
              borderRadius: '8px',
              backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
              color: theme === 'dark' ? '#f9fafb' : '#111827',
              fontSize: '16px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            placeholder="Enter your email"
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: theme === 'dark' ? '#d1d5db' : '#374151',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Password
          </label>
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
              borderRadius: '8px',
              backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
              color: theme === 'dark' ? '#f9fafb' : '#111827',
              fontSize: '16px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            placeholder="Enter your password"
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: theme === 'dark' ? '#d1d5db' : '#374151',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={credentials.confirmPassword}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
              borderRadius: '8px',
              backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
              color: theme === 'dark' ? '#f9fafb' : '#111827',
              fontSize: '16px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            placeholder="Confirm your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div style={{
        textAlign: 'center',
        marginTop: '24px',
        color: theme === 'dark' ? '#9ca3af' : '#6b7280',
        fontSize: '14px'
      }}>
        Already have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          style={{
            background: 'none',
            border: 'none',
            color: '#3b82f6',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontSize: '14px'
          }}
        >
          Sign in
        </button>
      </div>
    </div>
  );
};