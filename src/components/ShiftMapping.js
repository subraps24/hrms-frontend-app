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
} from '@mui/material';
import { useMediaQuery } from '@mui/material';
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const ShiftMapping = () => {
    const [shiftMappings, setShiftMappings] = useState([]);
    const [shiftMasters, setShiftMasters] = useState([]);
    const [employees, setEmployees] = useState([]);
	const [uploadedFile, setUploadedFile] = useState(null); // State for uploaded file																				  
    const [logoutModal, setLogoutModal] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [currentMapping, setCurrentMapping] = useState(null);
    const [newMapping, setNewMapping] = useState({
        employee_id: "",
        employee_name: "",
        shift_id: "",
        shift_name: "",
        shift_start_time: "",
        shift_end_time: "",
        mapping_date: new Date().toISOString().split("T")[0], // Initialize with current date
    });
    const isSmallScreen = useMediaQuery('(max-width:600px)'); // Media query for small screens
    const isTabletScreen = useMediaQuery('(max-width:960px)'); // For tablets
    const [error, setError] = useState("");
    const navigate = useNavigate();
    // Fetch data on load
    useEffect(() => {
        fetchShiftMappings();
        fetchShiftMasters();
        fetchEmployees();
    }, []);

    const fetchShiftMappings = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/shift-mappings");
            setShiftMappings(response.data);
        } catch (error) {
            console.error("Error fetching shift mappings:", error);
        }
    };

    const fetchShiftMasters = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/shift-masters");
            setShiftMasters(response.data);
        } catch (error) {
            console.error("Error fetching shift masters:", error);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/employees");
            setEmployees(response.data);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewMapping((prev) => ({ ...prev, [name]: value }));
    };

    const handleEmployeeChange = (e) => {
        const selectedEmployee = employees.find(emp => emp.employee_name === e.target.value);
        setNewMapping((prev) => ({
            ...prev,
            employee_name: selectedEmployee.employee_name,
            employee_id: selectedEmployee.employee_id,
        }));
							
																		 
											
						 
											  
						 
																	  
													   
		 
    };

const handleDownloadExcel = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/shift-mappings/template", {
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "Shift_Mapping_Template.xlsx");
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Error downloading Excel template:", error);
            alert("Failed to download Excel template");
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        setUploadedFile(file);
					
												 
											 
													   
												   
			
    };

    const handleUploadExcel = async () => {
        if (!uploadedFile) {
            alert("Please select a file to upload.");
            return;
        }

const formData = new FormData();
        formData.append("file", uploadedFile);

        try {
											  

								 
										  
								
            const response = await axios.post("http://localhost:5000/api/shift-mappings/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
															 
					
								  
																					  
            alert("Shift mappings uploaded successfully!");
			 
            fetchShiftMappings(); // Refresh the data
								
						
        } catch (error) {
            console.error("Error uploading Excel file:", error);
            alert("Failed to upload Excel file");
        }
    };






    const handleShiftChange = (e) => {
        const selectedShift = shiftMasters.find(shift => shift.shift_name === e.target.value);
        setNewMapping((prev) => ({
            ...prev,
            shift_name: selectedShift.shift_name,
            shift_id: selectedShift.shift_id,
            shift_start_time: selectedShift.start_time,
            shift_end_time: selectedShift.end_time,
        }));
    };

    const handleAddMapping = async () => {
        if (!newMapping.employee_id || !newMapping.shift_id || !newMapping.mapping_date) {
            setError("All fields are required");
            return;
        }

										
											  

        try {
            const payload = { ...newMapping };

            if (currentMapping) {
                // Update existing mapping
                await axios.put(
                    `http://localhost:5000/api/shift-mappings/${currentMapping.mapping_id}`,
                    payload
                );
                alert("Shift mapping updated successfully!");
            } else {
                // Add new mapping
                await axios.post("http://localhost:5000/api/shift-mappings", payload);
                alert("Shift mapping added successfully!");
            }
            fetchShiftMappings();
            setOpenModal(false);
            resetForm();
        } catch (error) {
            console.error("Error saving shift mapping:", error);
            alert("Failed to save shift mapping");
        }
    };

    const handleEditMapping = (mapping) => {
        setCurrentMapping(mapping);
        setNewMapping({
            ...mapping,
            mapping_date: new Date(mapping.mapping_date).toISOString().split("T")[0], // Format date
        });
        setOpenModal(true);
    };

    const handleDeleteMapping = async (mappingId) => {
        if (window.confirm("Are you sure you want to delete this mapping?")) {
            try {
                await axios.delete(`http://localhost:5000/api/shift-mappings/${mappingId}`);
                alert("Shift mapping deleted successfully!");
                fetchShiftMappings();
            } catch (error) {
                console.error("Error deleting shift mapping:", error);
                alert("Failed to delete shift mapping");
            }
        }
    };

    const resetForm = () => {
        setNewMapping({
            employee_id: "",
            employee_name: "",
            shift_id: "",
            shift_name: "",
            shift_start_time: "",
            shift_end_time: "",
            mapping_date: new Date().toISOString().split("T")[0],
        });
        setError("");
        setCurrentMapping(null);
    };

    return (
        <Box
            sx={{
                padding: 2,
                width: '100%',
                maxWidth: '1250px',
                margin: '0 auto', // Center the content
            }}
        >
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
                        Shift Mapping Details
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

		<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                <Button variant="contained" color="primary" onClick={handleDownloadExcel}>
                    Download Excel Template
                </Button>

                <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                    id="upload-input"
                />
                <label htmlFor="upload-input">
                    <Button variant="contained" component="span" sx={{ marginLeft: 2 }}>
                        Select Excel File
                    </Button>
                </label>

                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleUploadExcel}
                    disabled={!uploadedFile}
                    sx={{ marginLeft: 2 }}
                >
                    Upload Excel File
                </Button>
            </Box>																										  
																						  
										   
						 

					  
							   
										
											   
											   
									 
				  
											  
																						
										 
							 
						

            <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>
                Add Shift Mapping
									 
											   
											
										  
				 
									 
            </Button>
				  

												
            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Employee ID</TableCell>
                            <TableCell>Employee Name</TableCell>
                            <TableCell>Shift Name</TableCell>
                            <TableCell>Shift Start Time</TableCell>
                            <TableCell>Shift End Time</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {shiftMappings.map((mapping) => (
                            <TableRow key={mapping.mapping_id}>
                                <TableCell>{mapping.employee_id}</TableCell>
                                <TableCell>{mapping.employee_name}</TableCell>
                                <TableCell>{mapping.shift_name}</TableCell>
                                <TableCell>{mapping.shift_start_time}</TableCell>
                                <TableCell>{mapping.shift_end_time}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => handleEditMapping(mapping)}
                                        sx={{ marginRight: 1 }}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => handleDeleteMapping(mapping.mapping_id)}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add/Edit Shift Mapping Modal */}
            <Modal open={openModal} onClose={() => setOpenModal(false)}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "50%",
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        {currentMapping ? "Edit Shift Mapping" : "Add Shift Mapping"}
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                select
                                fullWidth
                                label="Employee Name"
                                value={newMapping.employee_name || ""}
                                onChange={handleEmployeeChange}
                            >
                                {employees.map((emp) => (
                                    <MenuItem key={emp.employee_id} value={emp.employee_name}>
                                        {emp.employee_name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Employee ID"
                                name="employee_id"
                                value={newMapping.employee_id || ""}
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                select
                                fullWidth
                                label="Shift Name"
                                value={newMapping.shift_name || ""}
                                onChange={handleShiftChange}
                            >
                                {shiftMasters.map((shift) => (
                                    <MenuItem key={shift.shift_id} value={shift.shift_name}>
                                        {shift.shift_name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Shift Start Time"
                                value={newMapping.shift_start_time || ""}
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Shift End Time"
                                value={newMapping.shift_end_time || ""}
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Mapping Date"
                                value={newMapping.mapping_date || ""}
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>
                    </Grid>
                    {error && <Typography color="error">{error}</Typography>}
                    <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                        <Button variant="contained" color="primary" onClick={handleAddMapping}>
                            {currentMapping ? "Update" : "Save"}
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => {
                                setOpenModal(false);
                                resetForm();
                            }}
                        >
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

export default ShiftMapping;
