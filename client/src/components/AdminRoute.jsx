import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

const AdminRoute = ({ children }) => {
  const { loading, isAdmin } = useAuth();

  if (loading) return <Loader />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

export default AdminRoute;


