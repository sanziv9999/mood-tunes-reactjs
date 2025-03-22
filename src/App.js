import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
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

// Layout component for main app pages (with header and footer)
function MainLayout() {
  return (
    <>
      <CustomHeader />
      <Outlet /> {/* This will render the child routes (Hero, Features, etc.) */}
      <CustomFooter />
    </>
  );
}

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          {/* Main app pages with header and footer */}
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
          </Route>

          {/* Standalone pages without header and footer */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default App;