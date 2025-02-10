// Contractor Master

import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Button,
    Grid,
    Paper,
    Table,
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
import { useNavigate } from "react-router-dom";

const ContractorMaster = () => {
    document.title = "Autolec | Contractor Master";
    const [contractors, setContractors] = useState([]);
    const [selectedContractor, setSelectedContractor] = useState(null);
    const [locations, setLocations] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [logoutModal, setLogoutModal] = useState(false);
    const [noResultsModal, setNoResultsModal] = useState(false);
    const [newContractor, setNewContractor] = useState({
        contractor_name: "",
        contact_number: "",
        contractor_email: "",
        location_id: "",
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [errors, setErrors] = useState({});

    const userName = localStorage.getItem("userName");
    const isSmallScreen = useMediaQuery("(max-width:600px)");
    const isTabletScreen = useMediaQuery("(max-width:960px)");
    const navigate = useNavigate();

    useEffect(() => {
        fetchContractors();
        fetchLocations();
    }, []);

    const fetchContractors = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/contractors");
            const data = await response.json();
            setContractors(data);
        } catch (err) {
            console.error("Error fetching contractors:", err);
        }
    };

    const fetchLocations = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/locations");
            const data = await response.json();
            setLocations(data);
        } catch (err) {
            console.error("Error fetching locations:", err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewContractor((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddContractor = async () => {
        // Define required fields
        const requiredFields = ["contractor_name", "contact_number", "contractor_email", "location_id"];
        const newErrors = {};

        // Validate each field
        for (const field of requiredFields) {
            const value = newContractor[field] ? String(newContractor[field]).trim() : ""; // Convert to string and trim
            if (value === "") {
                newErrors[field] = `${field.replace("_", " ")} is required.`; // Add error message for empty fields
            }
        }

        // If there are validation errors, set errors and exit
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Prepare contractor data for submission
        const contractorData = {
            ...newContractor,
            created_by: userName, // Add created_by field
        };

        try {
            // Send POST request to the backend API
            const response = await fetch("http://localhost:5000/api/contractors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(contractorData), // Convert data to JSON
            });

            // Handle API response
            if (response.ok) {
                alert("Contractor added successfully");
                // Close modal and reset form fields
                setOpenModal(false);
                setNewContractor({
                    contractor_name: "",
                    contact_number: "",
                    contractor_email: "",
                    location_id: "",
                });
                setErrors({});
                fetchContractors(); // Refresh contractor list
            } else {
                // Handle unsuccessful response
                const errorData = await response.json();
                alert(`Failed to add contractor: ${errorData.message || "Unknown error"}`);
            }
        } catch (err) {
            // Handle network or other errors
            console.error("Error adding contractor:", err);
            alert("An unexpected error occurred while adding the contractor.");
        }
    };

    // Handle delete button click to open modal
    const openDeleteModal = (contractor) => {
        setSelectedContractor(contractor);
        setDeleteModalOpen(true);
    };

    // Confirm delete action
    const handleDeleteContractor = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/contractors/${selectedContractor.contractor_id}`,
                {
                    method: "DELETE",
                }
            );
            if (response.ok) {
                alert(`Contractor "${selectedContractor.contractor_name}" deleted successfully`);
                fetchContractors();
                setDeleteModalOpen(false);
                setSelectedContractor(null);
            } else {
                alert("Failed to delete contractor");
            }
        } catch (err) {
            console.error("Error deleting contractor:", err);
        }
    };

    // Close delete modal
    const handleCloseDeleteModal = () => {
        setDeleteModalOpen(false);
        setSelectedContractor(null);
    };

    const filteredContractors = contractors.filter((contractor) =>
        Object.values(contractor).some((value) =>
            value ? value.toString().toLowerCase().includes(searchQuery.toLowerCase()) : false
        )
    );

    useEffect(() => {
        if (searchQuery && filteredContractors.length === 0) {
            setNoResultsModal(true);
        }
    }, [searchQuery, filteredContractors]);

    return (
        <Box
            sx={{
                padding: 2,
                width: "100%",
                maxWidth: "1250px",
                margin: "0 auto",
            }}
        >
            {/* Navbar */}
            <AppBar position="static" sx={{ marginBottom: 2, backgroundColor: "#1e88e5" }}>
                <Toolbar
                    sx={{
                        justifyContent: "space-between",
                        flexDirection: isSmallScreen ? "column" : "row",
                        alignItems: isSmallScreen ? "stretch" : "center",
                        gap: 1,
                        padding: 2,
                    }}
                >
                    <Typography
                        variant={isSmallScreen ? "h6" : "h5"}
                        sx={{ textAlign: isSmallScreen ? "center" : "left", flexGrow: 1, fontWeight: "bold" }}
                    >
                        Contractor Master Details
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: isSmallScreen ? "center" : "flex-end",
                            width: isSmallScreen ? "100%" : "auto",
                        }}
                    >
                        <Button
                            variant="contained"
                            sx={{
                                fontSize: isSmallScreen ? "0.8rem" : "1rem",
                                padding: "6px 12px",
                                width: isSmallScreen ? "100%" : "auto",
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
                            onClick={() => setLogoutModal(true)}
                            sx={{
                                fontSize: isSmallScreen ? "0.8rem" : "1rem",
                                padding: "6px 12px",
                                width: isSmallScreen ? "100%" : "auto",
                                backgroundColor: "#b23b3b",
                                color: "White",
                                fontWeight: "bold",
                            }}
                        >
                            Logout
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Search Bar */}
            <Box sx={{ marginBottom: 2, display: "flex", justifyContent: "center" }}>
                <TextField
                    fullWidth
                    size="small"
                    label="Search Contractors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{
                        maxWidth: isSmallScreen ? "100%" : isTabletScreen ? "75%" : "50%",
                        margin: "0 auto",
                    }}
                />
            </Box>

            {/* Add Contractor Button */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", marginBottom: 2 }}>
                <Button
                    variant="contained"
                    onClick={() => setOpenModal(true)}
                    sx={{
                        fontSize: isSmallScreen ? "0.8rem" : "1rem",
                        padding: isSmallScreen ? "5px 10px" : "8px 16px",
                        backgroundColor: "#32CD32",
                        color: "black",
                        fontWeight: "bold",
                    }}
                >
                    Add Contractor
                </Button>
            </Box>

            {/* Responsive Layout */}
            {isSmallScreen || isTabletScreen ? (
                <Grid container spacing={2}>
                    {filteredContractors.map((contractor) => (
                        <Grid item xs={12} sm={6} key={contractor.contractor_id}>
                            <Paper elevation={3} sx={{ padding: 2 }}>
                                <Typography variant="h6">{contractor.contractor_name}</Typography>
                                <Typography>Contact: {contractor.contact_number}</Typography>
                                <Typography>Email: {contractor.contractor_email}</Typography>
                                <Typography>Location: {contractor.location_name || "N/A"}</Typography>
                                <Button
                                    variant="contained"
                                    color="error"
                                    sx={{ marginTop: 1 }}
                                    onClick={() => handleDeleteContractor(contractor.contractor_id)}
                                >
                                    Delete
                                </Button>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Paper elevation={3} sx={{ overflowX: "auto", marginBottom: 2 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                {["Contractor ID", "Name", "Contact", "Email", "Location", "Actions"].map((header) => (
                                    <TableCell key={header} sx={{ fontWeight: "bold" }}>
                                        {header}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredContractors.map((contractor) => (
                                <TableRow key={contractor.contractor_id}>
                                    <TableCell>{contractor.contractor_id}</TableCell>
                                    <TableCell>{contractor.contractor_name}</TableCell>
                                    <TableCell>{contractor.contact_number}</TableCell>
                                    <TableCell>{contractor.contractor_email}</TableCell>
                                    <TableCell>{contractor.location_name || "N/A"}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            onClick={() => openDeleteModal(contractor)}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            )}

            {/* Add Contractor Modal */}
            <Modal open={openModal} onClose={() => setOpenModal(false)}>
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
                        width: { xs: '90%', sm: '75%', md: '50%' },
                        maxHeight: '80vh',
                        overflowY: 'auto',
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        Add New Contractor
                    </Typography>
                    <Grid container spacing={2}>
                        {[
                            { label: 'Name', field: 'contractor_name' },
                            { label: 'Contact Number', field: 'contact_number' },
                            { label: 'Email', field: 'contractor_email' },
                        ].map(({ label, field }) => (
                            <Grid item xs={12} key={field}>
                                <TextField
                                    fullWidth
                                    label={label}
                                    name={field}
                                    value={newContractor[field]}
                                    onChange={handleInputChange}
                                    error={Boolean(errors[field])}
                                    helperText={errors[field]}
                                />
                            </Grid>
                        ))}
                        <Grid item xs={12}>
                            <TextField
                                select
                                fullWidth
                                label="Location"
                                name="location_id"
                                value={newContractor.location_id}
                                onChange={handleInputChange}
                                error={Boolean(errors.location_id)}
                                helperText={errors.location_id}
                            >
                                {locations.map((location) => (
                                    <MenuItem key={location.id} value={location.id}>
                                        {location.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>
                    <Box sx={{ textAlign: 'center', marginTop: 2 }}>
                        <Button variant="contained" color="primary" onClick={handleAddContractor} sx={{ marginRight: 2 }}>
                            Save
                        </Button>
                        <Button variant="outlined" color="secondary" onClick={() => setOpenModal(false)}>
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
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => {
                                localStorage.clear();
                                navigate('/');
                            }}
                        >
                            Yes, I Confirm
                        </Button>
                        <Button variant="outlined" onClick={() => setLogoutModal(false)}>
                            No
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* No Results Modal */}
            <Modal open={noResultsModal} onClose={() => setNoResultsModal(false)}>
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
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        No results found 😔
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            setNoResultsModal(false);
                            setSearchQuery('');
                        }}
                    >
                        Close
                    </Button>
                </Box>
            </Modal>
            {/* Delete Confirmation Modal */}
            <Modal open={deleteModalOpen} onClose={handleCloseDeleteModal}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        backgroundColor: "white",
                        padding: 4,
                        boxShadow: 24,
                        borderRadius: 2,
                        textAlign: "center",
                        width: isSmallScreen ? "90%" : "400px",
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        Are you sure you want to delete contractor:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: "bold", marginBottom: 2 }}>
                        {selectedContractor?.contractor_name}
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleDeleteContractor}
                        >
                            Yes, Delete
                        </Button>
                        <Button variant="outlined" onClick={handleCloseDeleteModal}>
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
};

export default ContractorMaster;