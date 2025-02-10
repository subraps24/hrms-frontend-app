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
} from '@mui/material';
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ShiftMaster = () => {
    const [shiftMasters, setShiftMasters] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [logoutModal, setLogoutModal] = useState(false);
    const [currentShift, setCurrentShift] = useState(null);
    const [newShift, setNewShift] = useState({
        shift_name: "",
        start_time: "",
        end_time: "",
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const isSmallScreen = useMediaQuery("(max-width:600px)");

    // Fetch shift master data on load
    useEffect(() => {
        fetchShiftMasters();
    }, []);

    const fetchShiftMasters = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/shift-masters");
            setShiftMasters(response.data);
        } catch (error) {
            console.error("Error fetching shift masters:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewShift((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddEditShift = async () => {
        const { shift_name, start_time, end_time } = newShift;
        if (!shift_name || !start_time || !end_time) {
            setError("All fields are required");
            return;
        }

        try {
            if (currentShift) {
                // Update existing shift
                await axios.put(`http://localhost:5000/api/shift-masters/${currentShift.shift_id}`, newShift);
                alert("Shift updated successfully!");
            } else {
                // Add new shift
                await axios.post("http://localhost:5000/api/shift-masters", newShift);
                alert("Shift added successfully!");
            }
            fetchShiftMasters();
            setOpenModal(false);
            resetForm();
        } catch (error) {
            console.error("Error saving shift:", error);
            alert("Failed to save shift");
        }
    };

    const handleEditShift = (shift) => {
        setCurrentShift(shift);
        setNewShift(shift);
        setOpenModal(true);
    };

    const handleDeleteShift = async (shiftId) => {
        if (window.confirm("Are you sure you want to delete this shift?")) {
            try {
                await axios.delete(`http://localhost:5000/api/shift-masters/${shiftId}`);
                alert("Shift deleted successfully!");
                fetchShiftMasters();
            } catch (error) {
                console.error("Error deleting shift:", error);
                alert("Failed to delete shift");
            }
        }
    };

    const resetForm = () => {
        setNewShift({
            shift_name: "",
            start_time: "",
            end_time: "",
        });
        setError("");
        setCurrentShift(null);
    };

    return (
        <Box
            sx={{
                padding: 2,
                width: '100%',
                maxWidth: '1250px',
                margin: '0 auto',
            }}
        >
            <AppBar position="static" sx={{ marginBottom: 2, backgroundColor: "#1e88e5" }}>
                <Toolbar>
                    <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: "bold" }}>
                        Shift Master
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="contained"
                            sx={{
                                backgroundColor: "#FFD700",
                                color: "black",
                                fontWeight: "bold",
                            }}
                            onClick={() => navigate(-1)}
                        >
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => setLogoutModal(true)}
                        >
                            Logout
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>
                Add Shift
            </Button>

            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Shift ID</TableCell>
                            <TableCell>Shift Name</TableCell>
                            <TableCell>Start Time</TableCell>
                            <TableCell>End Time</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {shiftMasters.map((shift) => (
                            <TableRow key={shift.shift_id}>
                                <TableCell>{shift.shift_id}</TableCell>
                                <TableCell>{shift.shift_name}</TableCell>
                                <TableCell>{shift.start_time}</TableCell>
                                <TableCell>{shift.end_time}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => handleEditShift(shift)}
                                        sx={{ marginRight: 1 }}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => handleDeleteShift(shift.shift_id)}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

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
                        {currentShift ? "Edit Shift" : "Add Shift"}
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Shift Name"
                                name="shift_name"
                                value={newShift.shift_name}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Start Time (HH:MM:SS)"
                                name="start_time"
                                value={newShift.start_time}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="End Time (HH:MM:SS)"
                                name="end_time"
                                value={newShift.end_time}
                                onChange={handleInputChange}
                            />
                        </Grid>
                    </Grid>
                    {error && <Typography color="error">{error}</Typography>}
                    <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                        <Button variant="contained" color="primary" onClick={handleAddEditShift}>
                            {currentShift ? "Update" : "Save"}
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

export default ShiftMaster;