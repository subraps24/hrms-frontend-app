import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PermissionManagement = () => {
    const [requests, setRequests] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [user, setUser] = useState({ email: "", role: "", name: "" });
    const [newRequest, setNewRequest] = useState({
        empId: '',
        empName: '',
        permissionDate: '',
        duration: '', // In hours
        reason: '',
    });
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch user details from local storage (adjust as needed)
    useEffect(() => {
        const storedUser = {
            email: localStorage.getItem("email"),
            role: localStorage.getItem("role"),
            name: localStorage.getItem("name"),
        };
        setUser(storedUser);
    }, []);

    // Fetch permission requests (adjust endpoint as needed)
    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const endpoint =
                    user.role === "Employee"
                        ? `http://localhost:5000/api/permission-requests?email=${user.email}`
                        : `http://localhost:5000/api/permission-requests`;
                const response = await axios.get(endpoint);
                setRequests(response.data);
            } catch (error) {
                console.error("Error fetching permission requests:", error);
            }
        };
        if (user.email) fetchRequests();
    }, [user]);

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

    const validatePermission = async (employeeId, permissionDate, duration) => {
        try {
            // Fetch total permission used for the month for this employee
            const year = new Date(permissionDate).getFullYear();
            const month = new Date(permissionDate).getMonth() + 1; // Month is 0-indexed
            const response = await axios.get(
                `http://localhost:5000/api/permission-requests/monthly-usage?employeeId=${employeeId}&year=${year}&month=${month}`
            );

            const usedHours = parseFloat(response.data.totalHours) || 0;
            const requestedHours = parseFloat(duration) || 0;
            const remainingHours = 2 - usedHours;

            if (requestedHours > remainingHours) {
                if (remainingHours <= 0) {
                    setErrorMessage(`Late Submission: No more permissions available for this month.`);
                } else {
                    setErrorMessage(`Request exceeds monthly limit. You have ${usedHours} hours used, ${remainingHours} hours remaining.  Consider applying for a shorter duration.`);
                }
                return false;
            }
            return true;
        } catch (error) {
            console.error("Error validating permission:", error);
            setErrorMessage("Error validating permission. Please try again.");
            return false;
        }
    };


    const handleSubmit = async () => {
        setErrorMessage(''); // Clear any previous error messages

        const { empId, empName, permissionDate, duration, reason } = newRequest;

        // Basic validation
        if (!empId || !empName || !permissionDate || !duration || !reason) {
            setErrorMessage('Please fill in all fields.');
            return;
        }

        // Validate permission duration against monthly limit
        const isValid = await validatePermission(empId, permissionDate, duration);
        if (!isValid) {
            return; // Stop submission if validation fails
        }


        try {
            const response = await axios.post("http://localhost:5000/api/permission-requests", {
                employee_id: empId,
                employee_name: empName,
                permission_date: permissionDate,
                duration: duration,
                reason: reason,
                created_by: user.email,
            });

            alert(response.data.message);

            // Update the requests state with the new permission request
            const newPermissionRequest = {
                permission_id: response.data.permission_id, // Adjust based on your API response
                employee_id: empId,
                employee_name: empName,
                permission_date: permissionDate,
                duration: duration,
                reason: reason,
                status: "Pending", // Assuming a default status
            };
            setRequests([...requests, newPermissionRequest]);
            setShowForm(false);
            setNewRequest({  // Clear the form
                empId: '',
                empName: '',
                permissionDate: '',
                duration: '',
                reason: '',
            });
        } catch (error) {
            console.error("Error creating permission request:", error.response?.data || error);
            setErrorMessage(error.response?.data?.error || "Failed to create permission request");
        }
    };


    const handleApprove = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/permission-requests/${id}`, {
                status: "Approved",
                role: user.role,
                email: user.email,
            });
            setRequests(requests.map((req) => (req.permission_id === id ? { ...req, status: "Approved" } : req)));
            alert("Permission request approved successfully");
        } catch (error) {
            console.error("Error approving permission request:", error);
        }
    };

    const handleReject = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/permission-requests/${id}`, {
                status: "Rejected",
                role: user.role,
                email: user.email,
            });
            setRequests(requests.map((req) => (req.permission_id === id ? { ...req, status: "Rejected" } : req)));
            alert("Permission request rejected successfully");
        } catch (error) {
            console.error("Error rejecting permission request:", error);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>Permission Management</h2>
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
            {errorMessage && (
                <div style={{ color: 'red', marginBottom: '10px' }}>{errorMessage}</div>
            )}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={styles.th}>Emp ID</th>
                        <th style={styles.th}>Emp Name</th>
                        <th style={styles.th}>Permission Date</th>
                        <th style={styles.th}>Duration (Hours)</th>
                        <th style={styles.th}>Reason</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map((request) => (
                        <tr key={request.permission_id} style={styles.tr}>
                            <td style={styles.td}>{request.employee_id}</td>
                            <td style={styles.td}>{request.employee_name}</td>
                            <td style={styles.td}>{new Date(request.permission_date).toLocaleDateString('en-IN')}</td>
                            <td style={styles.td}>{request.duration}</td>
                            <td style={styles.td}>{request.reason}</td>
                            <td style={styles.td}>{request.status}</td>
                            {user.role !== "Employee" && (
                                <td style={styles.td}>
                                    {request.status === "Pending" && (
                                        <>
                                            <button onClick={() => handleApprove(request.permission_id)} style={styles.approveBtn}>
                                                Approve
                                            </button>
                                            <button onClick={() => handleReject(request.permission_id)} style={styles.rejectBtn}>
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
                    <h3>New Permission Request</h3>
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
                            <label>Permission Date: </label>
                            <input
                                type="date"
                                name="permissionDate"
                                value={newRequest.permissionDate}
                                onChange={handleFormChange}
                                style={styles.input}
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Duration (Hours): </label>
                            <input
                                type="number"
                                name="duration"
                                value={newRequest.duration}
                                onChange={handleFormChange}
                                style={styles.input}
                                min="0.5"
                                step="0.5"
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Reason: </label>
                            <select
                                name="reason"
                                value={newRequest.reason}
                                onChange={handleFormChange}
                                style={styles.input}
                            >
                                <option value="" disabled>Select Reason</option>
                                <option value="Personal">Personal</option>
                                <option value="Medical">Medical</option>
                                <option value="Other">Other</option>
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

export default PermissionManagement;

