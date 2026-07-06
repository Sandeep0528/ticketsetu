import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-saffron">Ticket</span>
          <span className="text-indiagreen">Setu</span>
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link to="/events?category=movie" className="hover:text-saffron">Movies</Link>
          <Link to="/events?category=bus" className="hover:text-saffron">Buses</Link>
          <Link to="/events?category=train" className="hover:text-saffron">Trains</Link>
          <Link to="/events?category=event" className="hover:text-saffron">Events</Link>

          {isAuthenticated ? (
            <>
              <Link to="/my-bookings" className="hover:text-saffron">My Bookings</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="hover:text-saffron">Admin</Link>
              )}
              <span className="text-gray-500">Hi, {user.name.split(' ')[0]}</span>
              <button
                onClick={handleLogout}
                className="bg-gray-100 px-3 py-1.5 rounded-md hover:bg-gray-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-saffron">Login</Link>
              <Link
                to="/signup"
                className="bg-saffron text-white px-3 py-1.5 rounded-md hover:opacity-90"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
