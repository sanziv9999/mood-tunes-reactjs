import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import ErrorBoundary from './error/ErrorBoundary';
import Login from './auth/Login';
import Signup from './auth/Signup';
import CustomHeader from './components/CustomHeader';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import Download from './components/Download';
import CustomFooter from './components/CustomFooter';
import FacialExpressionDetection from './components/FacialExpressionDetection'; // Added FacialExpressionDetection
import CapturedExpression from './components/CapturedExpression';


// Layout component for all pages (with header and footer)
function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <CustomHeader />
      <main className="flex-grow">
        <Outlet />
      </main>
      <CustomFooter />
    </div>
  );
}

// // Protected Route component to ensure user is authenticated
// function ProtectedRoute({ children }) {
//   const token = window.localStorage.getItem("token");
//   return token ? children : <Navigate to="/login" replace />;
// }

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          <Route element={<MainLayout />}>
            <Route
              path="/"
              element={
                <>
                  <Hero />
                  <Features />
                  <HowItWorks />
                  <Testimonials />
                  <Download />
                </>
              }
            />
            <Route
              path="/facial-expression-detection"
              element={
                // <ProtectedRoute>
                  <FacialExpressionDetection />
                // </ProtectedRoute>
              }
            />
            <Route path='/captured-expression' element={ <CapturedExpression />}
            /> 
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default App;