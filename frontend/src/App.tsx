import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RoleSelection } from './components/RoleSelection';
import { TeacherLogin } from './components/TeacherLogin';
import { ParentLogin } from './components/ParentLogin';
import { PrincipalLogin } from './components/PrincipalLogin';
import { TeacherDashboard } from './components/TeacherDashboard';
import { ParentDashboard } from './components/ParentDashboard';
import { PrincipalDashboard } from './components/PrincipalDashboard';
import { AboutUs } from './components/AboutUs';

function AppContent() {
  const { userType, principal, teacher, student } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'principal' | 'teacher' | 'parent' | null>(null);
  const [showAbout, setShowAbout] = useState(false);

  if (showAbout) {
    return <AboutUs onBack={() => setShowAbout(false)} />;
  }

  if ((userType === 'principal' && !principal) || (userType === 'teacher' && !teacher) || (userType === 'parent' && !student)) {
    return <RoleSelection onSelectRole={setSelectedRole} onShowAbout={() => setShowAbout(true)} />;
  }

  if (!selectedRole && !userType) {
    return <RoleSelection onSelectRole={setSelectedRole} onShowAbout={() => setShowAbout(true)} />;
  }

  if (selectedRole === 'principal' && userType !== 'principal') {
    return <PrincipalLogin onBack={() => setSelectedRole(null)} />;
  }

  if (selectedRole === 'teacher' && userType !== 'teacher') {
    return <TeacherLogin onBack={() => setSelectedRole(null)} />;
  }

  if (selectedRole === 'parent' && userType !== 'parent') {
    return <ParentLogin onBack={() => setSelectedRole(null)} />;
  }

  if (userType === 'principal') {
    return <PrincipalDashboard />;
  }

  if (userType === 'teacher') {
    return <TeacherDashboard />;
  }

  if (userType === 'parent') {
    return <ParentDashboard />;
  }

  return <RoleSelection onSelectRole={setSelectedRole} onShowAbout={() => setShowAbout(true)} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
