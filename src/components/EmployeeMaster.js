import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Button,
    Grid,
    Paper,
    Table,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Modal,
    TextField,
    MenuItem,
    AppBar,
    Toolbar,
    useMediaQuery,
} from "@mui/material";
import * as XLSX from "xlsx";


import { useNavigate } from "react-router-dom";

const EmployeeMaster = () => {
    document.title = "Autolec | Employee Master";

    const userName = localStorage.getItem("userName") || "";
    const [employees, setEmployees] = useState([]);
    //const [mobile_number,setMobileNumber] = useState([]);
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState("");
    const [uploadedFile, setUploadedFile] = useState(null);

    const [openModal, setOpenModal] = useState(false);
    const [logoutModal, setLogoutModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [errors, setErrors] = useState({});
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [newEmployee, setNewEmployee] = useState(getInitialEmployeeState(userName));

    const navigate = useNavigate();
    const isSmallScreen = useMediaQuery("(max-width:600px)");

    const employeeFields = [
        { label: "Employee Name", field: "employee_name" },
        { label: "Location ID", field: "location_id", select: true },
        { label: "Mobile Number", field: "mobile_number" },
        { label: "Aadhaar Number", field: "aadhaar_number" },
        { label: "Date of Birth", field: "dob", type: "date" },
        { label: "Address", field: "address", multiline: true },
        { label: "Father Name", field: "father_name" },
        { label: "Mother Name", field: "mother_name" },
        { label: "Marital Status", field: "marital_status", select: true, options: ["Single", "Married", "Divorced"] },
        { label: "Sex", field: "sex", select: true, options: ["Male", "Female", "Other"] },
        { label: "Blood Group", field: "blood_group", select: true, options: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+"] },
        { label: "ESI Number", field: "esi_number" },
        { label: "PF Number", field: "pf_number" },
        { label: "EMAIL ID", field: "education" },
    ];

    useEffect(() => {
        fetchEmployees();
        fetchLocations();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/employees");
            const data = await response.json();
            setEmployees(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    const fetchLocations = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/locations");
            const data = await response.json();
            setLocations(data.map((loc) => ({ id: loc.id, name: loc.name })));
        } catch (error) {
            console.error("Error fetching locations:", error);
        }
    };

    const handleDownloadExcel = () => {
        if (!selectedLocation) {
            alert("Please select a location before downloading the template.");
            return;
        }
        window.location.href = `http://localhost:5000/api/employees/template/${selectedLocation}`;
    };
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        setUploadedFile(file);
    };

    const handleUploadExcel = async () => {
        if (!uploadedFile) {
            alert("Please select an Excel file to upload.");
            return;
        }

        if (!selectedLocation) {
            alert("Please select a location before uploading the file.");
            return;
        }

        const formData = new FormData();
        formData.append("file", uploadedFile);
        formData.append("location_id", selectedLocation);

        try {
            const response = await fetch("http://localhost:5000/api/employees/upload", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                alert("Employees uploaded successfully!");
            } else {
                const error = await response.json();

                alert(`Error uploading employees: ${error.message}`);
            }
        } catch (error) {
            console.error("Error uploading file:", error);

        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEmployee((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditEmployee = (employee) => {
        setIsEditing(true);
        setSelectedEmployeeId(employee.id); // Pass the `id` of the selected employee
        setNewEmployee(employee); // Pre-fill the modal with the employee's data
        setOpenModal(true);
    };

    const handleSaveEmployee = async () => {
        const requiredFields = ["employee_name", "location_id"];
        const validationErrors = {};

        requiredFields.forEach((field) => {
            if (!newEmployee[field]) {
                validationErrors[field] = `${field.replace("_", " ")} is required.`;

            }
        });

        if (Object.keys(validationErrors).length) {
            console.error("Validation errors:", validationErrors);
            setErrors(validationErrors);
            return;
        }





        try {
            const url = isEditing
                ? `http://localhost:5000/api/employees/${selectedEmployeeId}`
                : "http://localhost:5000/api/employees";
            const method = isEditing ? "PUT" : "POST";

            console.log("Payload to be sent:", newEmployee);

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newEmployee),
            });

            if (response.ok) {
                alert(isEditing ? "Employee updated successfully" : "Employee added successfully");
                setOpenModal(false);
                setNewEmployee(getInitialEmployeeState(userName));
                fetchEmployees();
            } else {
                const errorData = await response.json();
                console.error("Error response:", errorData);
                alert(`Failed to save employee: ${errorData.message || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error saving employee:", error);
            alert("An unexpected error occurred.");
        }
    };


    const resetForm = () => {
        setNewEmployee(getInitialEmployeeState(userName));
        setErrors({});
        setIsEditing(false);
        setOpenModal(false);
    };

    function getInitialEmployeeState(userName) {
        return {
            employee_id: "",
            employee_name: "",
            location_id: "",
            mobile_number: "",
            aadhaar_number: "",
            dob: "",
            address: "",
            father_name: "",
            mother_name: "",
            marital_status: "",
            sex: "",
            blood_group: "",
            esi_number: "",
            pf_number: "",
            education: "",
            created_by: userName,
        };
    }

    return (
        <Box sx={{ padding: 2 }}>
            {/* Navbar */}
            <AppBar position="static" sx={{ marginBottom: 2, backgroundColor: "#1e88e5" }}>
                <Toolbar
                    sx={{
                        justifyContent: 'space-between',
                        flexDirection: isSmallScreen ? 'column' : 'row',
                        alignItems: isSmallScreen ? 'stretch' : 'center',
                        gap: 1,
                        padding: 2,
                    }}
                >
                    <Typography
                        variant={isSmallScreen ? 'h6' : 'h5'}
                        sx={{ textAlign: isSmallScreen ? 'center' : 'left', flexGrow: 1, fontWeight: "bold" }}
                    >
                        Employees Master Details
                    </Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 1,
                            justifyContent: isSmallScreen ? 'center' : 'flex-end',
                            width: isSmallScreen ? '100%' : 'auto',
                        }}
                    >
                        <Button
                            variant="contained"
                            sx={{
                                fontSize: isSmallScreen ? '0.8rem' : '1rem',
                                padding: '6px 12px',
                                width: isSmallScreen ? '100%' : 'auto',
                                backgroundColor: "#FFD700", color: "black", fontWeight: "bold"
                            }}
                            onClick={() => navigate(-1)}
                        >
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => setLogoutModal(true)}
                            sx={{
                                fontSize: isSmallScreen ? '0.8rem' : '1rem',
                                padding: '6px 12px',
                                width: isSmallScreen ? '100%' : 'auto',
                                backgroundColor: "#b23b3b", color: "White", fontWeight: "bold"
                            }}
                        >
                            Logout
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box sx={{ display: "flex", justifyContent: "space-around", alignItems: "center", marginBottom: 2 }}>
                <Box sx={{ display: "flex", gap: 1, flex: 1 }}>
                    <TextField
                        size="small"
                        label="Search Employees"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '50%' }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            if (searchQuery.trim() === "") {
                                alert("Please enter a search query.");
                                return;
                            }
                            const filteredEmployees = employees.filter(
                                (employee) =>
                                    employee.employee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    employee.employee_id?.includes(searchQuery)
                            );
                            if (filteredEmployees.length === 0) {
                                alert("No employees found for the search query.");
                            } else {
                                setEmployees(filteredEmployees);
                            }
                        }}
                    >
                        Search
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            setSearchQuery("");
                            fetchEmployees(); // Reset to the original employee list
                        }}
                    >
                        Clear
                    </Button>
                    <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>
                        Add Employee
                    </Button>
                </Box>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "row", gap: 1, marginBottom: 4 }}>
                {/* Dropdown to Select Location */}
                <TextField
                    select
                    label="Select Location"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    style={{ width: '36%' }}
                >
                    {locations.map((loc) => (
                        <MenuItem key={loc.id} value={loc.id}>
                            {loc.name}
                        </MenuItem>
                    ))}
                </TextField>

                {/* Download Excel Template */}
                <Button variant="contained" color="primary" onClick={handleDownloadExcel}>
                    Download Template
                </Button>

                {/* Upload Excel File */}
                <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                    id="upload-input"
                />
                <label htmlFor="upload-input">
                    <Button variant="contained" component="span">
                        Upload File
                    </Button>

                </label>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleUploadExcel}
                    disabled={!uploadedFile}
                >
                    Submit Upload File
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {["Employee ID", "Name", "Mobile Number", "Location", "Created At"].map((header) => (
                                <TableCell key={header} sx={{ fontWeight: "bold" }}>
                                    {header}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {employees.map((employee) => (
                            <TableRow
                                key={employee.employee_id}
                                onClick={() => handleEditEmployee(employee)} // Open edit modal
                                sx={{ cursor: "pointer" }} // Add cursor pointer for better UX
                            >
                                <TableCell>{employee.employee_id}</TableCell>
                                <TableCell>{employee.employee_name}</TableCell>
                                <TableCell>{employee.mobile_number || "-"}</TableCell>
                                <TableCell>{employee.location_name || "N/A"}</TableCell>
                                <TableCell>{new Date(employee.created_at).toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>

                </Table>
            </TableContainer>

            <Modal open={openModal} onClose={resetForm}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: isSmallScreen ? "90%" : "50%",
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                        maxHeight: "80vh",
                        overflowY: "auto",
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        {isEditing ? "Edit Employee" : "Add Employee"}
                    </Typography>
                    <Grid container spacing={2}>
                        {employeeFields.map(({ label, field, select, options, ...props }) => (
                            <Grid item xs={12} key={field}>
                                {field === "location_id" ? (
                                    // Updated `TextField` for Location Dropdown
                                    <TextField
                                        select
                                        fullWidth
                                        label="Location"
                                        name="location_id"
                                        value={newEmployee.location_id || ""}
                                        onChange={handleInputChange}
                                        error={Boolean(errors.location_id)}
                                        helperText={errors.location_id}
                                    >
                                        {locations.map((loc) => (
                                            <MenuItem key={loc.id} value={loc.id}>
                                                {loc.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>

                                ) : select ? (
                                    <TextField
                                        select
                                        fullWidth
                                        label={label}
                                        name={field}
                                        value={newEmployee[field] || ""}
                                        onChange={handleInputChange}
                                        error={Boolean(errors[field])}
                                        helperText={errors[field]}
                                        {...props}
                                    >
                                        {(options || []).map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                ) : (
                                    <TextField
                                        fullWidth
                                        label={label}
                                        name={field}
                                        value={newEmployee[field] || ""}
                                        onChange={handleInputChange}
                                        error={Boolean(errors[field])}
                                        helperText={errors[field]}
                                        {...props}
                                    />
                                )}
                            </Grid>
                        ))}
                    </Grid>
                    <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                        <Button variant="contained" color="primary" onClick={handleSaveEmployee}>
                            {isEditing ? "Update" : "Save"}
                        </Button>
                        <Button variant="outlined" color="secondary" onClick={resetForm}>
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* Logout Modal */}
            <Modal open={logoutModal} onClose={() => setLogoutModal(false)}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'white',
                        padding: isSmallScreen ? 2 : 4,
                        boxShadow: 24,
                        borderRadius: 2,
                        textAlign: 'center',
                        width: { xs: '90%', sm: '400px' },
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 'bold',
                            marginBottom: 2,
                        }}
                    >
                        Confirm Logout
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                        Are you sure you want to log out?
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 2 }}>
                        <Button variant="contained" color="error" onClick={() => { localStorage.clear(); navigate('/') }}>
                            Yes, I Confirm
                        </Button>
                        <Button variant="outlined" onClick={() => setLogoutModal(false)}>
                            No
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
};

export default EmployeeMaster;
