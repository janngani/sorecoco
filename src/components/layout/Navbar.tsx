import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';
import { api } from '@/src/lib/api';
import { Button } from '@/components/ui/button';
import { LogOut, User, LayoutDashboard } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const Navbar: React.FC = () => {
  const { user, userData, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [systemLogo, setSystemLogo] = useState<string | null>(null);

  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.settings.get('system');
        if (data.value) {
          setSystemLogo(JSON.parse(data.value).logoUrl);
        }
      } catch (error: any) {
        console.error("Navbar settings fetch error:", error);
      }
    };

    fetchSettings();
  }, []);

  const handleLogout = async () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {systemLogo ? (
            <img src={systemLogo} alt="SORECO-1 Logo" className="h-10 w-10 object-contain" />
          ) : user && userData?.profileImage ? (
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src={userData.profileImage} />
              <AvatarFallback className="bg-primary text-white font-bold">
                {userData.fullName?.charAt(0) || 'S'}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white font-bold text-xl shadow-sm shadow-primary/20">
              S1
            </div>
          )}
          <span className="text-xl font-bold tracking-tight text-foreground hidden sm:inline-block">
            SORECO-1 Portal
          </span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {!isLandingPage && (
                <>
                  <Link to={isAdmin ? "/admin" : "/dashboard"}>
                    <Button variant="ghost" className="gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      <span className="hidden md:inline">Dashboard</span>
                    </Button>
                  </Link>
                  {!isAdmin && (
                    <Link to="/profile">
                      <Button variant="ghost" className="gap-2">
                        <User className="h-4 w-4" />
                        <span className="hidden md:inline">Profile</span>
                      </Button>
                    </Link>
                  )}
                </>
              )}
              <Button variant="outline" onClick={handleLogout} className="gap-2 border-primary text-primary hover:bg-primary hover:text-white">
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-primary hover:bg-primary/90">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
