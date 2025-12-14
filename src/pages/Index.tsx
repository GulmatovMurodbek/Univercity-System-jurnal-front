import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, selectRole } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // User-ро аз localStorage мегирем
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      selectRole(parsedUser.role); // setUser дар AuthContext
      navigate(`/${parsedUser.role}`);
    } else {
      navigate("/login")
      setLoading(false); // агар user набошад, loading false мешавад
    }
  }, [navigate, selectRole]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Агар user вуҷуд надошта бошад, метавонед login page ё welcome page нишон диҳед
  return <div>Welcome to University System. Please login.</div>;
};

export default Index;
