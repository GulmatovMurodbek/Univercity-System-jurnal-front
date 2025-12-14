import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  selectRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: Record<UserRole, User> = {
  student: {
    id: '1',
    email: 'student@university.edu',
    name: 'Akbar Mahmudov',
    role: 'student',
    faculty: 'Computer Science',
    course: 3,
    group: 'CS-301',
    gpa: 3.75,
  },
  teacher: {
    id: '2',
    email: 'teacher@university.edu',
    name: 'Dr. Farrukh Karimov',
    role: 'teacher',
    faculty: 'Computer Science',
    subjects: ['Data Structures', 'Algorithms', 'Database Systems'],
  },
  admin: {
    id: '3',
    email: 'admin@university.edu',
    name: 'Rustam Aliyev',
    role: 'admin',
    faculty: 'Administration',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
console.log(user);

  // Ҳангоми боркунӣ, user-ро аз localStorage бор мекунем
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    // Simulate API call
    const loggedUser = mockUsers[role];
    setUser(loggedUser);

    // Ба localStorage захира мекунем
    localStorage.setItem('user', JSON.stringify(loggedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const selectRole = (role: UserRole) => {
    const selectedUser = mockUsers[role];
    setUser(selectedUser);
    localStorage.setItem('user', JSON.stringify(selectedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        selectRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
