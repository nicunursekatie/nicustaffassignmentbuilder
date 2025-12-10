import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import NICUStaffingWizard from './components/NICUStaffingWizard'
import StaffManagement from './components/StaffManagement'

function Navigation() {
  const location = useLocation()
  
  return (
    <nav className="bg-white shadow-sm border-b mb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              to="/"
              className={`inline-flex items-center px-4 border-b-2 text-sm font-medium ${
                location.pathname === '/'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Staffing Wizard
            </Link>
            <Link
              to="/staff"
              className={`inline-flex items-center px-4 border-b-2 text-sm font-medium ${
                location.pathname === '/staff'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Manage Staff
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <Routes>
          <Route path="/" element={<NICUStaffingWizard />} />
          <Route path="/staff" element={<StaffManagement />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

