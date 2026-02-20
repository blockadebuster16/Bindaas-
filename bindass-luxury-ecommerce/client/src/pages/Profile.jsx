import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user, logOut } = useAuth();
    const navigate = useNavigate();

    if (!user) return <div className="p-10 text-center">Please log in to view your profile.</div>;

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-serif mb-6">User Profile</h1>
            <div className="bg-white p-6 shadow rounded-lg">
                <div className="flex items-center space-x-4 mb-6">
                    {user.photoURL && <img src={user.photoURL} alt="Profile" className="w-16 h-16 rounded-full" />}
                    <div>
                        <h2 className="text-xl font-bold">{user.displayName}</h2>
                        <p className="text-gray-600">{user.email}</p>
                    </div>
                </div>

                <button
                    onClick={() => {
                        if (window.confirm("Are you sure you want to logout?")) {
                            logOut();
                            navigate('/');
                        }
                    }}
                    className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                    Logout
                </button>
                <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Order History</h3>
                    <p className="text-gray-500 italic">No orders yet.</p>
                </div>
            </div>
        </div>
    );
};

export default Profile;
