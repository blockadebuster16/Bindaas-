import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const SignInModal = () => {
    const { user, googleSignIn, facebookSignIn, signInWithEmail, signUpWithEmail, updateUserProfile, isAuthModalOpen, setIsAuthModalOpen } = useAuth();
    const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
    const [error, setError] = useState('');

    // Login Form State
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Register Form State
    const [regData, setRegData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        birthdate: '',
        mobile: '',
        gender: ''
    });

    useEffect(() => {
        if (user) return;

        const hasDismissed = sessionStorage.getItem('hasDismissedSignIn');
        if (!hasDismissed) {
            const timer = setTimeout(() => {
                setIsAuthModalOpen(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [user, setIsAuthModalOpen]);

    const handleClose = () => {
        setIsAuthModalOpen(false);
        sessionStorage.setItem('hasDismissedSignIn', 'true');
    };

    const handleGoogle = async () => {
        try {
            setError('');
            await googleSignIn();
            handleClose();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleFacebook = async () => {
        try {
            setError('');
            await facebookSignIn();
            handleClose();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            await signInWithEmail(loginEmail, loginPassword);
            handleClose();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        if (regData.password !== regData.confirmPassword) {
            return setError("Passwords do not match");
        }
        try {
            setError('');
            const userCredential = await signUpWithEmail(regData.email, regData.password);
            await updateUserProfile(userCredential.user, {
                displayName: `${regData.firstName} ${regData.lastName}`
            });

            // Get Firebase token
            const token = await userCredential.user.getIdToken();
            
            // Sync extra fields to Supabase
            await axios.post(`${API_BASE_URL}/api/users/profile/sync`, {
                firstName: regData.firstName,
                lastName: regData.lastName,
                birthdate: regData.birthdate,
                mobile: regData.mobile,
                gender: regData.gender
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            handleClose();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRegChange = (e) => {
        setRegData({ ...regData, [e.target.name]: e.target.value });
    };

    if (!isAuthModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm font-sans p-4">
            <div className="bg-gray-100 w-full max-w-[450px] max-h-[90vh] relative shadow-2xl my-auto animate-fade-in-up flex flex-col rounded overflow-hidden">
                
                {/* Close Button Header (Outside Tabs) */}
                <div className="absolute top-2 right-2 z-10">
                    <button onClick={handleClose} className="text-gray-500 hover:text-black">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tab Headers */}
                <div className="flex border-b border-gray-200 bg-white flex-shrink-0">
                    <button 
                        onClick={() => setActiveTab('login')}
                        className={`flex-1 py-4 text-sm font-bold tracking-wider uppercase transition-colors ${activeTab === 'login' ? 'bg-[#117b76] text-white relative after:content-[""] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:border-[8px] after:border-transparent after:border-t-[#117b76]' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Login
                    </button>
                    <button 
                        onClick={() => setActiveTab('register')}
                        className={`flex-1 py-4 text-sm font-bold tracking-wider uppercase transition-colors ${activeTab === 'register' ? 'bg-[#117b76] text-white relative after:content-[""] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:border-[8px] after:border-transparent after:border-t-[#117b76]' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Register
                    </button>
                </div>

                {/* Form Container */}
                <div className="p-8 bg-[#f5f5f5] overflow-y-auto flex-1 custom-scrollbar">
                    {error && <div className="mb-4 text-red-600 text-sm text-center">{error}</div>}

                    {/* LOGIN TAB */}
                    {activeTab === 'login' && (
                        <div>
                            <div className="flex gap-4 mb-6">
                                <button 
                                    onClick={handleFacebook}
                                    className="flex-1 bg-white border border-gray-300 rounded flex items-center justify-center py-2.5 gap-2 hover:bg-gray-50"
                                >
                                    <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                    <span className="text-sm font-semibold text-gray-700">Facebook</span>
                                </button>
                                <button 
                                    onClick={handleGoogle}
                                    className="flex-1 bg-white border border-gray-300 rounded flex items-center justify-center py-2.5 gap-2 hover:bg-gray-50"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                                    <span className="text-sm font-semibold text-gray-700">Google</span>
                                </button>
                            </div>

                            <div className="flex items-center justify-center my-6">
                                <span className="text-sm text-gray-500 font-medium">- OR -</span>
                            </div>

                            <form onSubmit={handleLoginSubmit}>
                                <input 
                                    type="email" 
                                    placeholder="Enter Email Address"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    required
                                    className="w-full border border-gray-300 rounded p-3 mb-4 text-sm focus:outline-none focus:border-[#117b76]"
                                />
                                <input 
                                    type="password" 
                                    placeholder="Enter Password"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    required
                                    className="w-full border border-gray-300 rounded p-3 mb-6 text-sm focus:outline-none focus:border-[#117b76]"
                                />
                                <button 
                                    type="submit"
                                    className="w-full bg-[#f05355] text-white py-3 rounded text-sm font-bold tracking-widest hover:bg-[#e04345] transition-colors"
                                >
                                    PROCEED
                                </button>
                            </form>
                            <div className="text-center mt-6">
                                <span className="text-sm text-gray-600">New User ? </span>
                                <button onClick={() => setActiveTab('register')} className="text-sm text-red-500 hover:underline">Create Account</button>
                            </div>
                        </div>
                    )}

                    {/* REGISTER TAB */}
                    {activeTab === 'register' && (
                        <div>
                            <div className="flex gap-4 mb-6">
                                <button 
                                    onClick={handleFacebook}
                                    type="button"
                                    className="flex-1 bg-white border border-gray-300 rounded flex items-center justify-center py-2.5 gap-2 hover:bg-gray-50"
                                >
                                    <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                    <span className="text-sm font-semibold text-gray-700">Facebook</span>
                                </button>
                                <button 
                                    onClick={handleGoogle}
                                    type="button"
                                    className="flex-1 bg-white border border-gray-300 rounded flex items-center justify-center py-2.5 gap-2 hover:bg-gray-50"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                                    <span className="text-sm font-semibold text-gray-700">Google</span>
                                </button>
                            </div>

                            <div className="flex items-center justify-center my-6">
                                <span className="text-sm text-gray-500 font-medium">- OR -</span>
                            </div>

                        <form onSubmit={handleRegisterSubmit}>
                            <div className="flex gap-4 mb-4">
                                <input 
                                    type="text" name="firstName" placeholder="First Name *" required
                                    value={regData.firstName} onChange={handleRegChange}
                                    className="w-1/2 border border-gray-300 rounded p-3 text-sm focus:outline-none focus:border-[#117b76]"
                                />
                                <input 
                                    type="text" name="lastName" placeholder="Last Name" 
                                    value={regData.lastName} onChange={handleRegChange}
                                    className="w-1/2 border border-gray-300 rounded p-3 text-sm focus:outline-none focus:border-[#117b76]"
                                />
                            </div>
                            <input 
                                type="email" name="email" placeholder="Email ID *" required
                                value={regData.email} onChange={handleRegChange}
                                className="w-full border border-gray-300 rounded p-3 mb-4 text-sm focus:outline-none focus:border-[#117b76]"
                            />
                            <input 
                                type="password" name="password" placeholder="Choose New Password *" required minLength={6}
                                value={regData.password} onChange={handleRegChange}
                                className="w-full border border-gray-300 rounded p-3 mb-4 text-sm focus:outline-none focus:border-[#117b76]"
                            />
                            <input 
                                type="password" name="confirmPassword" placeholder="Confirm Password *" required minLength={6}
                                value={regData.confirmPassword} onChange={handleRegChange}
                                className="w-full border border-gray-300 rounded p-3 mb-4 text-sm focus:outline-none focus:border-[#117b76]"
                            />
                            <input 
                                type="date" name="birthdate" required
                                value={regData.birthdate} onChange={handleRegChange}
                                className="w-full border border-gray-300 rounded p-3 mb-1 text-sm focus:outline-none focus:border-[#117b76] text-gray-500"
                            />
                            <p className="text-[11px] text-gray-500 mb-4 ml-1">(Avail 10% Birthday discount as a member)</p>
                            
                            <div className="flex border border-gray-300 rounded mb-6 overflow-hidden focus-within:border-[#117b76]">
                                <span className="bg-gray-100 p-3 text-sm text-gray-600 border-r border-gray-300">+91</span>
                                <input 
                                    type="tel" name="mobile" placeholder="Mobile Number(For order status update) *" required
                                    value={regData.mobile} onChange={handleRegChange}
                                    className="w-full p-3 text-sm focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center gap-4 mb-8">
                                <span className="text-sm text-gray-600 mr-2">Gender</span>
                                <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                                    <input type="radio" name="gender" value="Male" onChange={handleRegChange} className="mr-2 accent-[#f05355]" required/> Male
                                </label>
                                <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                                    <input type="radio" name="gender" value="Female" onChange={handleRegChange} className="mr-2 accent-[#f05355]" required/> Female
                                </label>
                                <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                                    <input type="radio" name="gender" value="Other" onChange={handleRegChange} className="mr-2 accent-[#f05355]" required/> Other
                                </label>
                            </div>

                            <button 
                                type="submit"
                                className="w-full bg-[#117b76] text-white py-3 rounded text-sm font-bold tracking-widest hover:bg-[#0e635f] transition-colors"
                            >
                                REGISTER
                            </button>

                            <div className="text-center mt-6">
                                <span className="text-sm text-gray-600">Already a Customer? </span>
                                <button type="button" onClick={() => setActiveTab('login')} className="text-sm text-red-500 hover:underline">Login</button>
                            </div>
                        </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SignInModal;
