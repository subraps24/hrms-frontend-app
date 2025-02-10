// Location Master

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import * as XLSX from "xlsx";
import { useMediaQuery } from '@mui/material';

const LocationMaster = () => {
    document.title = "Autolec | Location Master";
    const [locations, setLocations] = useState([]);
    const [uploadedData, setUploadedData] = useState([]);
    const [openModalAL, setOpenModalAL] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [logoutModal, setLogoutModal] = useState(false);
    const [noResultsModal, setNoResultsModal] = useState(false);
    const [newLocation, setNewLocation] = useState({
        name: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        country: '',
        pincode: '',
        contact_number: '',
        google_maps_url: '',
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMapUrl, setSelectedMapUrl] = useState(''); // To store the map URL
    const [mapModal, setMapModal] = useState(false); // To manage the map modal's visibility

    // const userName = localStorage.getItem('userName');
    const isSmallScreen = useMediaQuery('(max-width:600px)'); // Media query for small screens
    const isTabletScreen = useMediaQuery('(max-width:960px)'); // For tablets
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/locations');
            const data = await response.json();
            setLocations(data);
        } catch (err) {
            console.error('Error fetching locations:', err);
        }
    };


    const handleDownloadTemplate = () => {
        window.location.href = "http://localhost:5000/api/locations/template";

    };

    const handleUploadFile = (event) => {
        const file = event.target.files[0];
        if (!file) {
            alert("No file selected.");
            return;
        }

        const validExtensions = [".xlsx", ".xls", ".csv"];
        const fileExtension = file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();

        if (!validExtensions.includes(`.${fileExtension}`)) {
            alert("Invalid file type. Please upload an Excel or CSV file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });

                if (sheetData.length > 0) {
                    console.log("Parsed Data:", sheetData);
                    setUploadedData(sheetData);
                    setOpenModal(true);
                } else {
                    alert("Uploaded file is empty or invalid.");
                }
            } catch (err) {
                console.error("Error reading file:", err);
                alert("Error reading the file. Please ensure it is a valid Excel/CSV file.");
            }
        };
        reader.readAsArrayBuffer(file);
    };




    const handleSaveData = async () => {
        console.log('Uploaded Data:', uploadedData); // Debugging

        try {
            const response = await fetch("http://localhost:5000/api/locations/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(uploadedData),
            });
            if (response.ok) {
                alert("Locations saved successfully");
                setOpenModal(false);
                fetchLocations();
            } else {
                const errorData = await response.json();
                console.error('Save failed:', errorData); // Log backend error response
                alert("Failed to save locations");
            }
        } catch (error) {
            console.error("Error saving locations:", error);
        }
    };


    const handleSaveDataforexcel = async () => {
        if (!uploadedData || uploadedData.length === 0) {
            alert("No data to save. Please upload a valid file.");
            return;
        }

        try {
            // Convert `uploadedData` to a Blob as Excel/CSV format
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(uploadedData);
            XLSX.utils.book_append_sheet(workbook, worksheet, "Locations");

            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

            const formData = new FormData();
            formData.append("file", blob, "locations.xlsx");

            const response = await fetch("http://localhost:5000/api/locations/upload", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                alert("Locations saved successfully.");
                setOpenModal(false);
                fetchLocations(); // Refresh the locations table
            } else {
                const errorText = await response.text();
                console.error("Save failed:", errorText);
                alert("Failed to save locations. Please check the server logs.");
            }
        } catch (error) {
            console.error("Error saving locations:", error);
            alert("An error occurred while saving locations. Please try again.");
        }
    };



    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewLocation((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddLocation = async () => {
        const requiredFields = [
            'name',
            'address_line1',
            'address_line2',
            'city',
            'state',
            'country',
            'pincode',
            'contact_number',
            'google_maps_url',
        ];
        const newErrors = {};
        for (const field of requiredFields) {
            if (!newLocation[field] || newLocation[field].trim() === '') {
                newErrors[field] = `${field.replace('_', ' ')} is required.`;
            }
        }


        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors); // Display errors
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLocation),
            });
            if (response.ok) {
                alert('Location added successfully');
                setOpenModalAL(false);
                setNewLocation({
                    name: '',
                    address_line1: '',
                    address_line2: '',
                    city: '',
                    state: '',
                    country: '',
                    pincode: '',
                    contact_number: '',
                    google_maps_url: '',
                });
                setErrors({});
                fetchLocations(); // Refresh the table
            } else {
                alert('Failed to add location');
            }
        } catch (err) {
            console.error('Error adding location:', err);
        }
    };


    const filteredLocations = locations.filter((loc) =>
        Object.values(loc).some((value) =>
            value ? value.toString().toLowerCase().includes(searchQuery.toLowerCase()) : false
        )
    );

    useEffect(() => {
        // Show the "No Results Found" modal if the search returns no results
        if (searchQuery && filteredLocations.length === 0) {
            setNoResultsModal(true);
        }
    }, [searchQuery, filteredLocations]);

    const countries = [
        'India'
    ];

    const india = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
        'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
        'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
        'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    ];

    const cityData = {
        India: {
            'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Kakinada', 'Nellore'],
            'Arunachal Pradesh': ['Itanagar', 'Tawang', 'Naharlagun', 'Ziro'],
            'Assam': ['Guwahati', 'Dibrugarh', 'Jorhat', 'Tinsukia', 'Silchar'],
            'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia'],
            'Chhattisgarh': ['Raipur', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon'],
            'Goa': ['Panaji', 'Vasco da Gama', 'Margao', 'Mapusa'],
            'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
            'Haryana': ['Chandigarh', 'Gurugram', 'Faridabad', 'Ambala', 'Karnal'],
            'Himachal Pradesh': ['Shimla', 'Manali', 'Kullu', 'Dharamsala', 'Solan'],
            'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh'],
            'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum'],
            'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Kottayam', 'Thrissur'],
            'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain'],
            'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
            'Manipur': ['Imphal', 'Thoubal', 'Churachandpur', 'Kakching'],
            'Meghalaya': ['Shillong', 'Tura', 'Jowai', 'Nongstoin'],
            'Mizoram': ['Aizawl', 'Lunglei', 'Champhai', 'Kolasib'],
            'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Wokha'],
            'Odisha': ['Bhubaneswar', 'Cuttack', 'Berhampur', 'Rourkela', 'Sambalpur'],
            'Punjab': ['Chandigarh', 'Amritsar', 'Ludhiana', 'Jalandhar', 'Patiala'],
            'Rajasthan': ['Jaipur', 'Udaipur', 'Jodhpur', 'Kota', 'Ajmer'],
            'Sikkim': ['Gangtok', 'Mangan', 'Jorethang'],
            'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
            'Telangana': ['Hyderabad', 'Warangal', 'Khammam', 'Karimnagar', 'Nizamabad'],
            'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar', 'Ambassa'],
            'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Ghaziabad'],
            'Uttarakhand': ['Dehradun', 'Nainital', 'Haridwar', 'Rishikesh', 'Haldwani'],
            'West Bengal': ['Kolkata', 'Siliguri', 'Durgapur', 'Asansol', 'Howrah'],
        }
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
                        Location Master Details
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

            {/* Search Bar */}
            <Box sx={{ marginBottom: 2, display: 'flex', justifyContent: 'center' }}>
                <TextField
                    fullWidth
                    size="small"
                    label="Search Locations"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{
                        maxWidth: isSmallScreen ? '100%' : isTabletScreen ? '75%' : '50%',
                        margin: '0 auto',
                    }}
                />
            </Box>
            {/* Add Location Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 2 }}>
                <Button
                    variant="contained"
                    onClick={() => setOpenModalAL(true)}
                    sx={{
                        fontSize: isSmallScreen ? '0.8rem' : '1rem',
                        padding: isSmallScreen ? '5px 10px' : '8px 16px',
                        backgroundColor: "#32CD32", color: "black", fontWeight: "bold"
                    }}
                >
                    Add Location
                </Button>
            </Box>

            <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
                <Button variant="contained" onClick={handleDownloadTemplate}>
                    Download Excel Template
                </Button>


                <input
                    type="file"
                    accept=".xlsx, .xls,.csv"
                    style={{ display: "none" }}
                    id="upload-button"
                    onChange={handleUploadFile}
                />
                <label htmlFor="upload-button">
                    <Button variant="contained" component="span">
                        Upload Excel File
                    </Button>
                </label>
            </Box>


            {/* Table */}
            <Paper
                elevation={3}
                sx={{
                    padding: 2,
                    overflowX: 'auto', // Enables horizontal scrolling for smaller screens
                    marginBottom: isSmallScreen ? 2 : 4,
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        marginBottom: 2,
                        textAlign: 'center',
                        textDecoration: 'underline',
                        fontSize: isSmallScreen ? '1rem' : '1.2rem',
                    }}
                >
                    Location List
                </Typography>
                <Table size="small">
                    <TableHead>
                        {!isSmallScreen && !isTabletScreen && ( // Hide table headings on small/tablet screens
                            <TableRow>
                                {[
                                    // 'Location ID',
                                    'Location Name',
                                    'Address Line 1',
                                    'Address Line 2',
                                    'City',
                                    'State',
                                    'Country',
                                    'Pincode',
                                    'Contact Number',
                                    'Google Maps Link',
                                ].map((header) => (
                                    <TableCell key={header} sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                                        {header}
                                    </TableCell>
                                ))}
                            </TableRow>
                        )}
                    </TableHead>
                    <TableBody>
                        {filteredLocations.map((loc) =>
                            isSmallScreen || isTabletScreen ? (
                                // List view for small and tablet screens
                                <Box
                                    key={loc.id}
                                    sx={{
                                        marginBottom: 2,
                                        padding: 2,
                                        border: '1px solid #ccc',
                                        borderRadius: '8px',
                                        backgroundColor: '#f9f9f9',
                                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                                        maxWidth: '90%', // Adjust width to fit screen
                                        margin: '0 auto', // Center the box
                                        fontFamily: "'Roboto', sans-serif",
                                    }}
                                >
                                    <Typography variant="h6" gutterBottom>
                                        {loc.name}
                                    </Typography>
                                    {/* <Typography>
                                        <strong>Location ID:</strong> {loc.id}
                                    </Typography> */}
                                    <Typography>
                                        <strong>Address Line 1:</strong> {loc.address_line1}
                                    </Typography>
                                    <Typography>
                                        <strong>Address Line 2:</strong> {loc.address_line2}
                                    </Typography>
                                    <Typography>
                                        <strong>City:</strong> {loc.city}
                                    </Typography>
                                    <Typography>
                                        <strong>State:</strong> {loc.state}
                                    </Typography>
                                    <Typography>
                                        <strong>Country:</strong> {loc.country}
                                    </Typography>
                                    <Typography>
                                        <strong>Pincode:</strong> {loc.pincode}
                                    </Typography>
                                    <Typography>
                                        <strong>Contact:</strong> {loc.contact_number}
                                    </Typography>
                                    <Typography>
                                        <strong>Map:</strong>{' '}
                                        <Button
                                            variant="text"
                                            color="primary"
                                            onClick={() => {
                                                setSelectedMapUrl(loc.google_maps_url);
                                                setMapModal(true);
                                            }}
                                        >
                                            View Map
                                        </Button>
                                    </Typography>
                                </Box>
                            ) : (
                                // Table row for larger screens
                                <TableRow key={loc.id}>
                                    {/* <TableCell>{loc.id}</TableCell> */}
                                    <TableCell>{loc.name}</TableCell>
                                    <TableCell>{loc.address_line1}</TableCell>
                                    <TableCell>{loc.address_line2}</TableCell>
                                    <TableCell>{loc.city}</TableCell>
                                    <TableCell>{loc.state}</TableCell>
                                    <TableCell>{loc.country}</TableCell>
                                    <TableCell>{loc.pincode}</TableCell>
                                    <TableCell>{loc.contact_number}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="text"
                                            color="primary"
                                            onClick={() => {
                                                setSelectedMapUrl(loc.google_maps_url);
                                                setMapModal(true);
                                            }}
                                        >
                                            View Map
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )
                        )}
                    </TableBody>
                </Table>
            </Paper>

            {/* Add Location Modal */}
            <Modal open={openModalAL} onClose={() => setOpenModalAL(false)}>
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
                        Add New Location
                    </Typography>

                    <Grid container spacing={2}>
                        {[
                            { label: 'Location Name', field: 'name' },
                            { label: 'Address Line 1', field: 'address_line1' },
                            { label: 'Address Line 2', field: 'address_line2' },
                        ].map(({ label, field }) => (
                            <Grid item xs={12} key={field}>
                                <TextField
                                    fullWidth
                                    label={label}
                                    name={field}
                                    value={newLocation[field]}
                                    onChange={handleInputChange}
                                    error={Boolean(errors[field])}
                                    helperText={errors[field]}
                                />
                            </Grid>
                        ))}

                        {/* Country, State, and City */}
                        <Grid item xs={12} sm={4}>
                            <TextField
                                select
                                fullWidth
                                label="Country"
                                name="country"
                                value={newLocation.country}
                                onChange={(e) => {
                                    handleInputChange(e);
                                    setNewLocation((prev) => ({ ...prev, city: '', state: '' })); // Reset city and state
                                    if (errors.country) setErrors((prev) => ({ ...prev, country: '' }));
                                }}
                                error={Boolean(errors.country)}
                                helperText={errors.country}
                            >
                                {countries.map((country) => (
                                    <MenuItem key={country} value={country}>
                                        {country}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                select
                                fullWidth
                                label="State"
                                name="state"
                                value={newLocation.state}
                                onChange={(e) => {
                                    handleInputChange(e);
                                    setNewLocation((prev) => ({ ...prev, city: '' })); // Reset city
                                    if (errors.state) setErrors((prev) => ({ ...prev, state: '' }));
                                }}
                                error={Boolean(errors.state)}
                                helperText={errors.state}
                                disabled={!newLocation.country}
                            >
                                {(india || []).map((state) => (
                                    <MenuItem key={state} value={state}>
                                        {state}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                select
                                fullWidth
                                label="City"
                                name="city"
                                value={newLocation.city}
                                onChange={(e) => handleInputChange(e)}
                                error={Boolean(errors.city)}
                                helperText={errors.city}
                                disabled={!newLocation.state}
                            >
                                {(cityData[newLocation.country]?.[newLocation.state] || []).map((city) => (
                                    <MenuItem key={city} value={city}>
                                        {city}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Pincode, Contact Number, Google Maps */}
                        {[
                            { label: 'Pincode', field: 'pincode' },
                            { label: 'Contact Number', field: 'contact_number' },
                            { label: 'Google Maps URL', field: 'google_maps_url' },
                        ].map(({ label, field }) => (
                            <Grid item xs={12} sm={6} key={field}>
                                <TextField
                                    fullWidth
                                    label={label}
                                    name={field}
                                    value={newLocation[field]}
                                    onChange={handleInputChange}
                                    error={Boolean(errors[field])}
                                    helperText={errors[field]}
                                />
                            </Grid>
                        ))}
                    </Grid>
                    <Box sx={{ textAlign: 'center', marginTop: 2 }}>
                        <Button variant="contained" color="primary" onClick={handleAddLocation} sx={{ marginRight: 2 }}>
                            Save
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => {
                                setOpenModalAL(false);
                                setNewLocation({
                                    name: '',
                                    address_line1: '',
                                    address_line2: '',
                                    city: '',
                                    state: '',
                                    country: '',
                                    pincode: '',
                                    contact_number: '',
                                    google_maps_url: '',
                                });
                                setErrors({}); // Clear any validation errors
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
            {/*Upload save modal*/}
            <Modal open={openModal} onClose={() => setOpenModal(false)}>
                <Box sx={{ padding: 4, backgroundColor: "white", maxWidth: "80%", margin: "auto", borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Uploaded Data
                    </Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {Object.keys(uploadedData[0] || {}).map((key) => (
                                    <TableCell key={key}>{key}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {uploadedData.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {Object.keys(row).map((key) => (
                                        <TableCell key={key}>
                                            <TextField
                                                value={row[key]}
                                                onChange={(e) => {
                                                    const updated = [...uploadedData];
                                                    updated[rowIndex][key] = e.target.value;
                                                    setUploadedData(updated);
                                                }}
                                            />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: 2 }}>
                        <Button variant="contained" onClick={handleSaveDataforexcel}>
                            Save
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
            {/* Google Map Modal */}
            <Modal open={mapModal} onClose={() => setMapModal(false)}>
                <Box
                    sx={{
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'white',
                        padding: 2,
                        boxShadow: 24,
                        borderRadius: 2,
                        width: { xs: '90%', sm: '70%', md: '50%' }, // Responsive width
                        height: { xs: '50%', sm: '60%', md: '70%' }, // Responsive height
                        overflow: 'hidden',
                        position: 'relative', // Ensure the close button stays inside the modal
                    }}
                >
                    {/* Close Button */}
                    <Button
                        onClick={() => setMapModal(false)}
                        sx={{
                            position: 'absolute',
                            top: 5,
                            right: 5,
                            minWidth: '30px',
                            minHeight: '30px',
                            padding: 0,
                            backgroundColor: '#8d7d37',
                            color: '#000',
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            borderRadius: '50%',
                            '&:hover': {
                                backgroundColor: '#a2b223',
                            },
                        }}
                    >
                        &times;
                    </Button>

                    {/* Map Iframe */}
                    <iframe
                        src={selectedMapUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        title="Google Maps View"
                    ></iframe>
                </Box>
            </Modal>
        </Box>
    );
};

export default LocationMaster;