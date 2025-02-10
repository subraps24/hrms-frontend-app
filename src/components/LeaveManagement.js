import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LeaveManagement = () => {
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState({ email: "", role: "", name: "" });
  const [newRequest, setNewRequest] = useState({
    empId: '',
    empName: '',
    leaveStartDate: '',
    leaveEndDate: '',
    typeOfLeave: '',
    status: 'Pending',
  });

  // Fetch user details from local storage
  useEffect(() => {
    const storedUser = {
      email: localStorage.getItem("email"),
      role: localStorage.getItem("role"),
      name: localStorage.getItem("name"),
    };
    setUser(storedUser);
  }, []);

  // Fetch leave requests based on role
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const endpoint =
          user.role === "Employee"
            ? `http://localhost:5000/api/leave-requests?email=${user.email}`
            : `http://localhost:5000/api/leave-requests`;
        const response = await axios.get(endpoint);
        setRequests(response.data);
      } catch (error) {
        console.error("Error fetching leave requests:", error);
      }
    };
    if (user.email) fetchRequests(); // Only fetch if user data is available
  }, [user]);


   // Fetch logged-in user data
   useEffect(() => {
    const fetchUser = async () => {
      try {
        const email = localStorage.getItem('userEmail'); // Replace with actual logged-in user's email
        const response = await axios.get(`http://localhost:5000/api/users/me?email=${email}`);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUser();
  }, []);

  // Fetch leave requests from the backend
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/leave-requests");
        setRequests(response.data);
      } catch (error) {
        console.error("Error fetching leave requests:", error);
      }
    };
    fetchRequests();
  }, []);
  

   // Fetch employees
   useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/employees");
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'empName') {
      const selectedEmployee = employees.find((emp) => emp.employee_name === value);
      if (selectedEmployee) {
        setNewRequest({ ...newRequest, empName: value, empId: selectedEmployee.employee_id });
      }
    } else {
      setNewRequest({ ...newRequest, [name]: value });
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/leave-requests", {
        employee_id: newRequest.empId,
        employee_name: newRequest.empName,
        leave_type: newRequest.typeOfLeave,
        leave_start_date: newRequest.leaveStartDate,
        leave_end_date: newRequest.leaveEndDate,
        leave_reason: newRequest.leaveReason || "", // Ensure this exists
        created_by: user.email,
      });
  
      alert(response.data.message);
  
      // Add the new request to the current list
      const newLeaveRequest = {
        leave_id: response.data.leave_id,
        employee_id: newRequest.empId,
        employee_name: newRequest.empName,
        leave_type: newRequest.typeOfLeave,
        leave_start_date: newRequest.leaveStartDate,
        leave_end_date: newRequest.leaveEndDate,
        status: "Pending",
      };
      setRequests([...requests, newLeaveRequest]);
      setShowForm(false);
    } catch (error) {
      console.error("Error creating leave request:", error.response?.data || error);
      alert(error.response?.data?.error || "Failed to create leave request");
    }
  };
  
  

  const handleApprove = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/leave-requests/${id}`, {
        status: "Approved",
        role: user.role,
        email: user.email,
      });
      setRequests(requests.map((req) => (req.leave_id === id ? { ...req, status: "Approved" } : req)));
      alert("Leave request approved successfully");
    } catch (error) {
      console.error("Error approving leave request:", error);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/leave-requests/${id}`, {
        status: "Rejected",
        role: user.role,
        email: user.email,
      });
      setRequests(requests.map((req) => (req.leave_id === id ? { ...req, status: "Rejected" } : req)));
      alert("Leave request rejected successfully");
    } catch (error) {
      console.error("Error rejecting leave request:", error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Leave Management</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search requests..."
          style={{
            padding: '10px',
            width: '300px',
            border: '1px solid #ccc',
            borderRadius: '5px',
          }}
        />
        <div>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            New Request
          </button>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={styles.th}>Emp ID</th>
            <th style={styles.th}>Emp Name</th>
            <th style={styles.th}>Leave Start Date</th>
            <th style={styles.th}>Leave End Date</th>
            <th style={styles.th}>Type of Leave</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.leave_id} style={styles.tr}>
              <td style={styles.td}>{request.employee_id}</td>
              <td style={styles.td}>{request.employee_name}</td>
              <td style={styles.td}>{new Date (request.leave_start_date).toLocaleDateString('en-IN')}</td>
              <td style={styles.td}>{new Date (request.leave_end_date).toLocaleDateString('en-IN')}</td>
              <td style={styles.td}>{request.leave_type}</td>
              <td style={styles.td}>{request.status}</td>
              {user.role !== "Employee" && (
                <td style={styles.td}>
                  {request.status === "Pending" && (
                    <>
                      <button onClick={() => handleApprove(request.leave_id)} style={styles.approveBtn}>
                        Approve
                      </button>
                      <button onClick={() => handleReject(request.leave_id)} style={styles.rejectBtn}>
                        Reject
                      </button>
                    </>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>

      </table>

      {showForm && (
        <div style={styles.modal}>
          <h3>New Leave Request</h3>
          <form>
            <div style={{ marginBottom: '10px' }}>
              <label>Emp Name: </label>
              <select
                name="empName"
                value={newRequest.empName}
                onChange={handleFormChange}
                style={styles.input}
              >
                <option value="" disabled>Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.employee_id} value={emp.employee_name}>
                    {emp.employee_name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Emp ID: </label>
              <input
                type="text"
                name="empId"
                value={newRequest.empId}
                readOnly
                style={styles.input}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Leave Start Date: </label>
              <input
                type="date"
                name="leaveStartDate"
                value={newRequest.leaveStartDate}
                onChange={handleFormChange}
                style={styles.input}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Leave End Date: </label>
              <input
                type="date"
                name="leaveEndDate"
                value={newRequest.leaveEndDate}
                onChange={handleFormChange}
                style={styles.input}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Type of Leave: </label>
              <select
                name="typeOfLeave"
                value={newRequest.typeOfLeave}
                onChange={handleFormChange}
                style={styles.input}
              >
                <option value="" disabled>Select Leave Type</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Casual Leave">Casual Leave</option>
                <option value="Earned Leave">Earned Leave</option>
              </select>
            </div>
            <button type="button" onClick={handleSubmit} style={styles.submitBtn}>
              Submit
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

const styles = {
  th: { border: '1px solid #ccc', padding: '10px', textAlign: 'left' },
  td: { border: '1px solid #ccc', padding: '10px' },
  tr: { backgroundColor: '#f9f9f9' },
  approveBtn: {
    backgroundColor: '#28a745',
    color: '#fff',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '5px',
    marginRight: '5px',
    cursor: 'pointer',
  },
  rejectBtn: {
    backgroundColor: '#dc3545',
    color: '#fff',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  modal: {
    backgroundColor: '#fff',
    padding: '20px',
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    borderRadius: '10px',
    width: '400px',
    zIndex: 1000,
  },
  input: {
    padding: '8px',
    width: '100%',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  submitBtn: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default LeaveManagement;