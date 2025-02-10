import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Attendance from './components/Attendance';
import ProtectedRoute from './components/ProtectedRoute';
import LocationMaster from './components/LocationMaster';
import Register from './components/Register';
import ContractorMaster from './components/ContractorMaster';
import AdminPanel from './components/AdminPanel';
import EmployeeMaster from './components/EmployeeMaster';
import ShiftMapping from './components/ShiftMapping'; // Import ShiftMapping Component
import ShiftMaster from './components/ShiftMaster'; // Import ShiftMapping Component
import OrganizeAttendance from './components/OrganizeAttendance'; // Import organize Attendance Component
import PayrollMaster from './components/PayrollMaster';
import ConsolidatedAttendance from './components/ConsolidatedAttendance';
import PayrollProcessing from './components/PayrollProcessing';
import PayrollMapping from './components/PayrollMapping';
import chatbot from './components/Chatbot';
import Payslip from './components/Payslip';
import LeaveManagement from './components/LeaveManagement';

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin" element={<ProtectedRoute component={AdminPanel} roles={['Admin']} />} />

                {/* Protected Routes */}
                <Route
                    path="/dashboard"
                    element={<ProtectedRoute component={Dashboard} roles={['Admin', 'HR', 'Manager', 'Sr. Manager', 'Department Head', 'Accounts Head', 'CFO', 'CEO','Employee']} />}
                />
                <Route
                    path="/attendance"
                    element={<ProtectedRoute component={Attendance} roles={['Admin', 'HR', 'Manager', 'Sr. Manager', 'Department Head', 'Accounts Head', 'CFO', 'CEO']} />}
                />
                <Route
                    path="/location-master"
                    element={<ProtectedRoute component={LocationMaster} roles={['Admin', 'HR', 'Manager', 'Sr. Manager', 'Department Head', 'Accounts Head', 'CFO', 'CEO']} />}
                />
                <Route
                    path="/contractor-master"
                    element={<ProtectedRoute component={ContractorMaster} roles={['Admin', 'HR', 'Manager', 'Sr. Manager', 'Department Head', 'Accounts Head', 'CFO', 'CEO']} />}
                />
                <Route
                    path="/employee-master"
                    element={<ProtectedRoute component={EmployeeMaster} roles={['Admin', 'HR', 'Manager', 'Sr. Manager', 'Department Head', 'Accounts Head', 'CFO', 'CEO']} />}
                />
                <Route
                    path="/shift-master"
                    element={<ProtectedRoute component={ShiftMaster} roles={['Admin', 'HR', 'Manager']} />} // Add ShiftMapping route here
                />

                <Route
                    path="/payroll-master"
                    element={<ProtectedRoute component={PayrollMaster} roles={['Admin', 'HR', 'Manager']} />} // Add ShiftMapping route here
                />
                <Route
                    path="/organize-attendance-data"
                    element={<ProtectedRoute component={OrganizeAttendance} roles={['Admin', 'HR', 'Manager']} />} // Add ShiftMapping route here
                />

                <Route
                    path="/consolidate-attendance-data"
                    element={<ProtectedRoute component={ConsolidatedAttendance} roles={['Admin', 'HR', 'Manager']} />} // Add ShiftMapping route here
                />

                <Route
                    path="/payroll-processing"
                    element={<ProtectedRoute component={PayrollProcessing} roles={['Admin', 'HR', 'Manager']} />} // Add ShiftMapping route here
                />
                <Route
                    path="/shift-mapping"
                    element={<ProtectedRoute component={ShiftMapping} roles={['Admin', 'HR', 'Manager']} />} // Add ShiftMapping route here
                />
               
               <Route
                    path="/pay-slip"
                    element={<ProtectedRoute component={Payslip} roles={['Admin', 'HR', 'Manager']} />} // Add ShiftMapping route here
                />
                <Route
                    path="/payroll-mapping"
                    element={<ProtectedRoute component={PayrollMapping} roles={['Admin', 'HR', 'Manager']} />} // Add ShiftMapping route here
                />
<Route
                    path="/leave-management"
                    element={<ProtectedRoute component={LeaveManagement} roles={['Admin', 'HR', 'Manager','Employee']} />} // Add ShiftMapping route here
                />
            </Routes>
        </Router>
    );
}

export default App;





// import React from "react";
// import OrganizeDataComponent from "./components/OrganizeDataComponent";

// function App() {
//   return (
//     <div>
//       <OrganizeDataComponent />
//     </div>
//   );
// }

// export default App;
