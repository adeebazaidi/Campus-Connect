import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

const StaffRoute = ({ children }) => {
  const { loading, isAdmin, isStaff } = useAuth();
  if (loading) return <Loader />;
  if (!isAdmin && !isStaff) return <Navigate to="/" replace />;
  return children;
};

export default StaffRoute;


