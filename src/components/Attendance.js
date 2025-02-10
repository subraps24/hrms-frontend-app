import React, { useState } from 'react';
import {
    Grid,
    Typography,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Modal,
    Box,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Attendance = () => {
    const [loading, setLoading] = useState(false);
    const [attendanceData, setAttendanceData] = useState([]);
    const [logoutModal, setLogoutModal] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm')); // Media query for small screens

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/attendance`);
            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.message || 'Error fetching attendance data');
                setAttendanceData([]);
                return;
            }
            const data = await response.json();
            setAttendanceData(data);
        } catch (error) {
            console.error('Error fetching attendance data:', error);
            alert('An unexpected error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setAttendanceData([]);
    };

    return (
        <Box sx={{ padding: 2 }}>
            {/* Header */}
            <Box
                sx={{
                    backgroundColor: '#1e88e5',
                    padding: isSmallScreen ? 1 : 2,
                    marginBottom: 2,
                    display: 'flex',
                    flexDirection: isSmallScreen ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Typography
                    variant="h6"
                    sx={{ color: 'white', fontWeight: 'bold', marginLeft: 2 }}
                >
                    Attendance Management
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, marginRight: 2 }}>
                    <Button
                        variant="contained"
                        sx={{ backgroundColor: '#FFD700', color: 'black', fontWeight: 'bold' }}
                        onClick={() => navigate(-1)}
                    >
                        BACK
                    </Button>
                    <Button
                        variant="contained"
                        sx={{ backgroundColor: '#b23b3b', color: 'white', fontWeight: 'bold' }}
                        onClick={() => setLogoutModal(true)}
                    >
                        LOGOUT
                    </Button>
                </Box>
            </Box>

            {/* Logout Confirmation Modal */}
            <Modal
                open={logoutModal}
                onClose={() => setLogoutModal(false)}
                aria-labelledby="logout-modal-title"
                aria-describedby="logout-modal-description"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 300,
                        backgroundColor: 'white',
                        padding: 4,
                        borderRadius: 2,
                        boxShadow: 24,
                        textAlign: 'center',
                    }}
                >
                    <Typography id="logout-modal-title" variant="h6" gutterBottom>
                        Confirm Logout
                    </Typography>
                    <Typography id="logout-modal-description" sx={{ marginBottom: 3 }}>
                        Are you sure you want to log out?
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => {
                                localStorage.clear();
                                navigate('/login'); // Adjust the route based on your app
                            }}
                        >
                            Yes, I Confirm
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => setLogoutModal(false)}
                        >
                            No
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* Attendance Management */}
            <Grid container spacing={2} sx={{ padding: 2 }}>
                <Grid item xs={12} md={6}>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: '#64ad6a ', // Replace with the custom blue color
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            '&:hover': {
                                backgroundColor: '#a7b75a', // Slightly darker shade for hover effect
                                color: 'black'
                            },
                        }}
                        fullWidth
                        onClick={fetchAttendance}
                    >
                        Fetch Attendance
                    </Button>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Button
                        variant="contained" // Changed from "outlined" to "contained" for background color
                        sx={{
                            backgroundColor: '#dfbdb4', // Custom background color
                            color: 'black', // Text color
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            '&:hover': {
                                backgroundColor: '#848484', // Hover color
                                color: 'white'
                            },
                        }}
                        fullWidth
                        onClick={handleClear}
                    >
                        Clear
                    </Button>
                </Grid>

                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ padding: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Attendance Data
                        </Typography>
                        {loading ? (
                            <CircularProgress />
                        ) : isSmallScreen ? (
                            // Mobile View: Render as cards
                            <Grid container spacing={2}>
                                {attendanceData.map((row, index) => (
                                    <Grid item xs={12} key={index}>
                                        <Paper elevation={3} sx={{ padding: 2 }}>
                                            <Typography>
                                                <strong>Employee ID:</strong> {row['Employee ID']}
                                            </Typography>
                                            <Typography>
                                                <strong>Employee Name:</strong> {row['Employee Name']}
                                            </Typography>
                                            <Typography>
                                                <strong>Total Work Duration:</strong> {row['Total Work Duration']}
                                            </Typography>
                                            <Typography>
                                                <strong>Total OT (Hrs):</strong> {row['Total OT (Hrs)']}
                                            </Typography>
                                            <Typography>
                                                <strong>Present Days:</strong> {row['Present Days']}
                                            </Typography>
                                            <Typography>
                                                <strong>Absent Days:</strong> {row['Absent Days']}
                                            </Typography>
                                            <Typography>
                                                <strong>Weekly Off:</strong> {row['Weekly Off']}
                                            </Typography>
                                            <Typography>
                                                <strong>Holidays:</strong> {row['Holidays']}
                                            </Typography>
                                            <Typography>
                                                <strong>Leaves Taken:</strong> {row['Leaves Taken']}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            // Desktop View: Render as table
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Employee ID</TableCell>
                                            <TableCell>Employee Name</TableCell>
                                            <TableCell>Total Work Duration</TableCell>
                                            <TableCell>Total OT (Hrs)</TableCell>
                                            <TableCell>Present Days</TableCell>
                                            <TableCell>Absent Days</TableCell>
                                            <TableCell>Weekly Off</TableCell>
                                            <TableCell>Holidays</TableCell>
                                            <TableCell>Leaves Taken</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {attendanceData.map((row, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{row['Employee ID']}</TableCell>
                                                <TableCell>{row['Employee Name']}</TableCell>
                                                <TableCell>{row['Total Work Duration']}</TableCell>
                                                <TableCell>{row['Total OT (Hrs)']}</TableCell>
                                                <TableCell>{row['Present Days']}</TableCell>
                                                <TableCell>{row['Absent Days']}</TableCell>
                                                <TableCell>{row['Weekly Off']}</TableCell>
                                                <TableCell>{row['Holidays']}</TableCell>
                                                <TableCell>{row['Leaves Taken']}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Attendance;