// Dashboard

import React, { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Button,
    IconButton,
    Modal,
    Avatar,
    List,
    ListItem,
    ListItemText,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SubrapsLogo from '../assets/SubrapsLogo.png';

const Dashboard = () => {
    document.title = 'Autolec | Dashboard';
    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

    const handleOpenProfileModal = () => {
        setProfileModalOpen(true);
    };

    const handleCloseProfileModal = () => {
        setProfileModalOpen(false);
    };

    const handleLogout = () => {
        // Clear local storage and navigate to the login page
        localStorage.clear();
        navigate('/');
    };

    return (
        <Box
            sx={{
                padding: 4,
                width: '100%',
                maxWidth: '1250px',
                margin: '0 auto',
            }}
        >
            {/* Header with user icon */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: { xs: 'center', sm: 'space-between' },
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    minHeight: { xs: '12vh', md: '10vh' },
                    backgroundColor: '#4a6347',
                    padding: { xs: '8px', sm: '16px' },
                    borderRadius: '8px',
                    gap: { xs: '8px', md: '0' },
                    marginBottom: '10px',
                }}
            >
                {/* Logo */}
                <Box
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        justifyContent: { xs: 'center', sm: 'flex-start' },
                        alignItems: 'center',
                    }}
                >
                    <img
                        src={SubrapsLogo}
                        alt="Logo"
                        style={{
                            maxHeight: '75px',
                            width: 'auto',
                            objectFit: 'contain',
                        }}
                    />
                </Box>

                {/* User Profile Icon and Name */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: { xs: 'center', sm: 'flex-end' },
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: '8px',
                    }}
                >
                    <IconButton
                        onClick={handleOpenProfileModal}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ bgcolor: 'primary.main', width: '40px', height: '40px' }}>
                            <AccountCircleIcon />
                        </Avatar>
                        <Typography
                            variant="h6"
                            sx={{
                                fontSize: { xs: '12px', sm: '14px', md: '16px' },
                                color: 'white',
                                textAlign: { xs: 'center', sm: 'left' },
                                whiteSpace: 'nowrap',
                                fontWeight: 'bold',
                            }}
                        >
                            Welcome, {userName}
                        </Typography>
                    </IconButton>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {/* Location Master */}
                <Grid item xs={12} sm={6} md={4}>
                    <Paper elevation={3} sx={{ padding: 2, textAlign: 'center' }}>
                        <Typography variant="h6">Location Master</Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/location-master')}
                        >
                            Manage Master Data
                        </Button>
                    </Paper>
                </Grid>



                {/* employee Master */}
                <Grid item xs={12} sm={6} md={4}>
                    <Paper elevation={3} sx={{ padding: 2, textAlign: 'center' }}>
                        <Typography variant="h6">Employee Master</Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/employee-master')}
                        >
                            Manage Employee
                        </Button>
                    </Paper>
                </Grid>
                {/* Shift Master */}
                <Grid item xs={12} sm={6} md={4}>
                    <Paper elevation={3} sx={{ padding: 2, textAlign: 'center' }}>
                        <Typography variant="h6">Shift Master</Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/shift-master')}
                        >
                            Manage Shift Master
                        </Button>
                    </Paper>

                </Grid>
                {/* Shift Mapping */}
                <Grid item xs={12} sm={6} md={4}>
                    <Paper elevation={3} sx={{ padding: 2, textAlign: 'center' }}>
                        <Typography variant="h6">Shift Mapping</Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/shift-mapping')}
                        >
                            View Shift Mapping
                        </Button>
                    </Paper>
                </Grid>
                 {/* Payroll Mapping */}
                 <Grid item xs={12} sm={6} md={4}>
                    <Paper elevation={3} sx={{ padding: 2, textAlign: 'center' }}>
                        <Typography variant="h6">Category Mapping</Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/payroll-mapping')}
                        >
                            View Category Mapping
                        </Button>
                    </Paper>
                </Grid>

                {/* Payroll Master */}
                <Grid item xs={12} sm={6} md={4}>
                    <Paper elevation={3} sx={{ padding: 2, textAlign: 'center' }}>
                        <Typography variant="h6">Payroll Master</Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/payroll-master')}
                        >
                            View Payroll Master
                        </Button>
                    </Paper>
                </Grid>



                {/* Organzie Attendance Data */}
                <Grid item xs={12} sm={6} md={4}>
                    <Paper elevation={3} sx={{ padding: 2, textAlign: 'center' }}>
                        <Typography variant="h6">Organize Attendance Data </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/organize-attendance-data')}
                        >
                            Organize Attendance Data
                        </Button>
                    </Paper>
                </Grid>

                {/* Consolidated Attendance Datar */}
                <Grid item xs={12} sm={6} md={4}>
                    <Paper elevation={3} sx={{ padding: 2, textAlign: 'center' }}>
                        <Typography variant="h6">ConsolidatedAttendance</Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/consolidate-attendance-data')}
                        >
                            View Consolidate Attendance 
                        </Button>
                    </Paper>
                </Grid>
                  {/* Payroll Processing Data */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Paper elevation={3} sx={{ padding: 2, textAlign: 'center' }}>
                        <Typography variant="h6">Payroll Processing </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/payroll-processing')}
                        >
                            Payroll Processing Data
                        </Button>
                    </Paper>
                </Grid>

                {/* Payroll Slip */}
<Grid item xs={12} sm={6} md={4}>
                    <Paper elevation={3} sx={{ padding: 2, textAlign: 'center' }}>
                        <Typography variant="h6">Payroll Slip</Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/pay-slip')}
                        >
                            View Payroll Slip
                        </Button>
                    </Paper>
                </Grid>
                  {/* Leave Management */}
<Grid item xs={12} sm={6} md={4}>
                    <Paper elevation={3} sx={{ padding: 2, textAlign: 'center' }}>
                        <Typography variant="h6">LeaveManagement</Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/leave-management')}
                        >
                            LeaveManagement
                        </Button>
                    </Paper>
                </Grid>
            {/* Permission Management */}
<Grid item xs={12} sm={6} md={4}>
                    <Paper elevation={3} sx={{ padding: 2, textAlign: 'center' }}>
                        <Typography variant="h6">Permission Mangement</Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/permission-management')}
                        >
                            Permission Management 
                        </Button>
                    </Paper>
                </Grid>

                {/* Admin Page */}
                {userRole === 'Admin' && (
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper elevation={3} sx={{ padding: 2, textAlign: 'center' }}>
                            <Typography variant="h6">Admin Page</Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => navigate('/admin')}
                            >
                                Go to Admin Page
                            </Button>
                        </Paper>
                    </Grid>
                    
                )}
            </Grid>

            {/* Profile Modal */}
            <Modal open={profileModalOpen} onClose={handleCloseProfileModal}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '90%', sm: 400 },
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        User Profile
                    </Typography>
                    <Divider />
                    <List>
                        <ListItem>
                            <ListItemText primary="Name" secondary={userName || 'N/A'} />
                        </ListItem>
                        <Divider />
                        <ListItem>
                            <ListItemText primary="Role" secondary={userRole || 'N/A'} />
                        </ListItem>
                    </List>
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Button
                            variant="contained"
                            color="secondary"
                            sx={{ mr: 2 }}
                            onClick={() => setLogoutConfirmOpen(true)}
                        >
                            Log Out
                        </Button>
                        <Button variant="contained" onClick={handleCloseProfileModal}>
                            Close
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* Logout Confirmation Dialog */}
            <Dialog
                open={logoutConfirmOpen}
                onClose={() => setLogoutConfirmOpen(false)}
            >
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Confirm Logout</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to log out?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setLogoutConfirmOpen(false)}>Cancel</Button>
                    <Button onClick={handleLogout} color="error" variant="contained">
                        Log Out
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Dashboard;