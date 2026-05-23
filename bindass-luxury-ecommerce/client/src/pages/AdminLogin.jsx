import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Reset Form State
  const [isResetting, setIsResetting] = useState(false);
  const [predefinedEmail, setPredefinedEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Unified production base URL
  const AUTH_API_URL = 'https://bindaas-ucyv.onrender.com/api/auth';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      // FIXED: Switched from localhost:5001 to Render production URL
      const response = await axios.post(`${AUTH_API_URL}/admin-login`, { email, password });

      if (response.data.success) {
        localStorage.setItem('adminToken', response.data.token);
        navigate('/admin'); 
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = { predefinedEmail, newEmail, newPassword };
      // FIXED: Switched from localhost:5001 to Render production URL
      const response = await axios.post(`${AUTH_API_URL}/admin-reset`, payload);

      if (response.data.success) {
        setSuccessMsg('Credentials successfully updated. Please sign in with your new credentials.');
        setIsResetting(false);
        setPredefinedEmail('');
        setNewEmail('');
        setNewPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset credentials. Make sure your predefined email is correct.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-display">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Admin Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isResetting ? 'Set up or recover your access' : 'Sign in to manage the store'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl border border-gray-100 sm:px-10">
          
          {error && (
            <div className="mb-4 bg-red-50 relative border-l-4 border-red-500 p-4">
               <div className="flex">
                  <div className="flex-shrink-0">
                     <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                     </svg>
                  </div>
                  <div className="ml-3">
                     <p className="text-sm text-red-700">{error}</p>
                  </div>
               </div>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 bg-green-50 relative border-l-4 border-green-500 p-4">
               <div className="flex">
                  <div className="flex-shrink-0">
                     <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                     </svg>
                  </div>
                  <div className="ml-3">
                     <p className="text-sm text-green-700">{successMsg}</p>
                  </div>
               </div>
            </div>
          )}

          {!isResetting ? (
              <form className="space-y-6" onSubmit={handleLogin}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <div className="mt-1">
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors" placeholder="admin@bindass.com" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <div className="mt-1">
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors" placeholder="••••••••" />
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <div className="text-sm">
                    <button type="button" onClick={() => { setIsResetting(true); setError(''); setSuccessMsg(''); }} className="font-medium text-primary hover:text-green-600 transition-colors">
                      Forgot or Setup Credentials?
                    </button>
                  </div>
                </div>

                <div>
                  <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors disabled:opacity-50">
                    {loading ? 'Authenticating...' : 'Sign in securely'}
                  </button>
                </div>
              </form>
          ) : (
              <form className="space-y-6" onSubmit={handleReset}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Verification Email *</label>
                  <p className="text-xs text-gray-500 mb-1">Enter the master email configured in the server.</p>
                  <div className="mt-1">
                    <input type="email" required value={predefinedEmail} onChange={(e) => setPredefinedEmail(e.target.value)} className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors" placeholder="master@example.com" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">New Login Email *</label>
                  <div className="mt-1">
                    <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors" placeholder="your.email@example.com" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password *</label>
                  <div className="mt-1">
                    <input type="password" required minLength="6" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors" placeholder="••••••••" />
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <div className="text-sm">
                    <button type="button" onClick={() => { setIsResetting(false); setError(''); setSuccessMsg(''); }} className="font-medium text-gray-500 hover:text-gray-900 transition-colors">
                      Back to Login
                    </button>
                  </div>
                </div>

                <div>
                  <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50">
                    {loading ? 'Updating...' : 'Update Credentials'}
                  </button>
                </div>
              </form>
          )}
          
           <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Return to Storefront</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => navigate('/')}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                   Back to Home
                </button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
