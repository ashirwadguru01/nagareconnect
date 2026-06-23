import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Citizen
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import NewComplaint from './pages/citizen/NewComplaint';
import MyComplaints from './pages/citizen/MyComplaints';
import ComplaintDetail from './pages/citizen/ComplaintDetail';
import Rewards from './pages/citizen/Rewards';
import MapView from './pages/citizen/MapView';

// Worker
import WorkerDashboard    from './pages/worker/WorkerDashboard';
import AssignedComplaints from './pages/worker/AssignedComplaints';
import WorkerAppraisal   from './pages/worker/WorkerAppraisal';

// Admin
import AdminDashboard   from './pages/admin/AdminDashboard';
import AdminComplaints  from './pages/admin/AdminComplaints';
import AdminUsers       from './pages/admin/AdminUsers';
import AdminWorkers     from './pages/admin/AdminWorkers';
import AdminAppraisals  from './pages/admin/AdminAppraisals';

const AppLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-900)' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        paddingTop: 56,
        minHeight: '100vh',
        background: 'var(--bg-900)',
        overflow: 'auto',
        transition: 'background 0.3s ease, color 0.3s ease',
      }}>
        {children}
      </main>
    </div>
  );
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'worker') return <Navigate to="/worker" replace />;
  return <Navigate to="/citizen" replace />;
};

const App = () => (
  <ThemeProvider>
    <AuthProvider>
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#111',
            color: '#f1f5f9',
            border: '1px solid #1e1e1e',
            borderRadius: '8px',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#000' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><RoleRedirect /></ProtectedRoute>} />

        {/* Citizen */}
        <Route path="/citizen" element={<ProtectedRoute roles={['citizen']}><AppLayout><CitizenDashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/citizen/new-complaint" element={<ProtectedRoute roles={['citizen']}><AppLayout><NewComplaint /></AppLayout></ProtectedRoute>} />
        <Route path="/citizen/complaints" element={<ProtectedRoute roles={['citizen']}><AppLayout><MyComplaints /></AppLayout></ProtectedRoute>} />
        <Route path="/citizen/complaints/:id" element={<ProtectedRoute roles={['citizen']}><AppLayout><ComplaintDetail /></AppLayout></ProtectedRoute>} />
        <Route path="/citizen/rewards" element={<ProtectedRoute roles={['citizen']}><AppLayout><Rewards /></AppLayout></ProtectedRoute>} />
        <Route path="/citizen/map" element={<ProtectedRoute roles={['citizen']}><AppLayout><MapView role="citizen" /></AppLayout></ProtectedRoute>} />

        {/* Worker */}
        <Route path="/worker"            element={<ProtectedRoute roles={['worker']}><AppLayout><WorkerDashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/worker/complaints" element={<ProtectedRoute roles={['worker']}><AppLayout><AssignedComplaints /></AppLayout></ProtectedRoute>} />
        <Route path="/worker/appraisal"  element={<ProtectedRoute roles={['worker']}><AppLayout><WorkerAppraisal /></AppLayout></ProtectedRoute>} />
        <Route path="/worker/map"        element={<ProtectedRoute roles={['worker']}><AppLayout><MapView role="worker" /></AppLayout></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin"             element={<ProtectedRoute roles={['admin']}><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/admin/complaints"  element={<ProtectedRoute roles={['admin']}><AppLayout><AdminComplaints /></AppLayout></ProtectedRoute>} />
        <Route path="/admin/users"       element={<ProtectedRoute roles={['admin']}><AppLayout><AdminUsers /></AppLayout></ProtectedRoute>} />
        <Route path="/admin/workers"     element={<ProtectedRoute roles={['admin']}><AppLayout><AdminWorkers /></AppLayout></ProtectedRoute>} />
        <Route path="/admin/map"         element={<ProtectedRoute roles={['admin']}><AppLayout><MapView role="admin" /></AppLayout></ProtectedRoute>} />
        <Route path="/admin/appraisals" element={<ProtectedRoute roles={['admin']}><AppLayout><AdminAppraisals /></AppLayout></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
