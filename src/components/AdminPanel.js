// AdminPanel;
import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button,
    Paper,
    AppBar,
    Toolbar,
    Select,
    MenuItem,
    Modal,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Card,
    CardContent,
    IconButton,
    Tooltip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@mui/material';

const AdminPanel = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState({});
    const [selectedLocations, setSelectedLocations] = useState({});
    const [locations, setLocations] = useState([]);
    const [editUserId, setEditUserId] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [currentRejectId, setCurrentRejectId] = useState(null);

    // const [backModalOpen, setBackModalOpen] = useState(false);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);

    const navigate = useNavigate();
    // const userName = localStorage.getItem('userName');

    const isSmallScreen = useMediaQuery('(max-width:600px)'); // Media query for small screens

    useEffect(() => {
        document.title = 'Autolec | Admin Panel';
        fetchPendingUsers();
        fetchLocations();

        const ws = new WebSocket('ws://localhost:5000');
        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);

            switch (message.type) {
                case 'NEW_REGISTRATION':
                    setPendingUsers((prev) => [...prev, message.payload]);
                    break;
                case 'USER_APPROVED':
                case 'USER_REJECTED':
                    setPendingUsers((prev) => prev.filter((user) => user.id !== message.payload.id));
                    break;
                default:
                    console.error('Unknown WebSocket message type:', message.type);
            }
        };

        return () => ws.close();
    }, []);

    const fetchPendingUsers = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/pending-users');
            const data = await response.json();
            setPendingUsers(data);

            const roles = {};
            const locations = {};
            data.forEach((user) => {
                roles[user.id] = user.role || '';
                locations[user.id] = user.location_id || null;
            });
            setSelectedRoles(roles);
            setSelectedLocations(locations);
        } catch (err) {
            console.error('Error fetching pending users:', err);
        }
    };

    const fetchLocations = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/locations');
            const data = await response.json();
            setLocations(data);
        } catch (err) {
            console.error('Error fetching locations:', err);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleApprove = async (id) => {
        const role = selectedRoles[id];
        const locationId = selectedLocations[id];

        if (!role) {
            alert('Please select a valid role before approving the user.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/approve-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, role, location_id: locationId }),
            });
            if (response.ok) {
                alert('User approved successfully');
            }
        } catch (err) {
            console.error('Error approving user:', err);
        }
    };

    const handleEdit = (id) => {
        setEditUserId(id);
        setEditModalOpen(true);
    };

    const handleEditSubmit = () => {
        setEditModalOpen(false);
    };

    const openRejectModal = (id) => {
        setCurrentRejectId(id);
        setRejectModalOpen(true);
    };

    const handleRejectSubmit = async () => {
        if (!rejectReason.trim()) {
            alert('Please enter a reason for rejection.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/reject-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: currentRejectId, reason: rejectReason }),
            });
            if (response.ok) {
                alert('User rejected successfully');
                setRejectModalOpen(false);
                setRejectReason('');
            }
        } catch (err) {
            console.error('Error rejecting user:', err);
        }
    };

    const roles = ['HR', 'Manager', 'Sr. Manager', 'Department Head', 'Accounts Head', 'CFO', 'CEO'];

    return (
        <Box>
            <AppBar position="static" sx={{ marginBottom: 2, backgroundColor: "#1e88e5" }}>
                <Toolbar sx={{
                    justifyContent: 'space-between',
                    flexDirection: isSmallScreen ? 'column' : 'row',
                    alignItems: isSmallScreen ? 'stretch' : 'center',
                    gap: 1,
                    padding: 2,
                }}>
                    {/* <Typography variant="h6">Welcome, {userName}</Typography> */}
                    <Typography variant={isSmallScreen ? 'h6' : 'h5'}
                        sx={{ textAlign: isSmallScreen ? 'center' : 'left', flexGrow: 1, fontWeight: "bold" }}>Admin Dashboard - Registration Approval</Typography>
                    <Box sx={{
                        display: 'flex',
                        gap: 1,
                        justifyContent: isSmallScreen ? 'center' : 'flex-end',
                        width: isSmallScreen ? '100%' : 'auto',
                    }}>
                        <Button
                            variant="contained"
                            sx={{
                                fontSize: isSmallScreen ? '0.8rem' : '1rem',
                                padding: '6px 12px',
                                width: isSmallScreen ? '100%' : 'auto',
                                backgroundColor: "#FFD700", color: "black", fontWeight: "bold"
                            }}
                            onClick={() => handleBack()}
                        >
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => setLogoutModalOpen(true)}
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

            <Box sx={{ padding: 4 }}>

                {/* Responsive View */}
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                    <Grid container spacing={2}>
                        {pendingUsers.map((user) => (
                            <Grid item xs={12} key={user.id}>
                                <Card>
                                    <CardContent>
                                        <Typography><strong>Name:</strong> {user.name}</Typography>
                                        <Typography><strong>Email:</strong> {user.email}</Typography>
                                        <Typography><strong>Role:</strong> {user.role || 'N/A'}</Typography>
                                        <Typography>
                                        <strong>Location:</strong> {user.location_name || 'Unknown'}
                                        </Typography>
                                        <iframe
                                            width="300"
                                            height="200"
                                            src={user.google_maps_url}
                                            title={`map-${user.id}`}
                                        />
                                        <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
                                            <Tooltip title="Approve">
                                                <IconButton
                                                    sx={{ color: 'green' }}
                                                    onClick={() => handleApprove(user.id)}
                                                >
                                                    <CheckCircleIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit">
                                                <IconButton
                                                    sx={{ color: 'blue' }}
                                                    onClick={() => handleEdit(user.id)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Reject">
                                                <IconButton
                                                    sx={{ color: 'red' }}
                                                    onClick={() => openRejectModal(user.id)}
                                                >
                                                    <CancelIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Desktop View */}
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Paper elevation={3} sx={{ overflowX: 'auto' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                {['Name', 'Email', 'Role', 'Location', 'Map', 'Created At', 'Actions'].map((header) => (
                                    <TableCell key={header} sx={{ fontWeight: 'bold' }}>
                                        {header}
                                    </TableCell>
                                ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pendingUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{selectedRoles[user.id]}</TableCell>
                                        <TableCell>{user.location_name || 'Unknown'}</TableCell>
                                        <TableCell>
                                            <iframe
                                                width="300"
                                                height="200"
                                                src={user.google_maps_url}
                                                title={`map-${user.id}`}
                                            />
                                        </TableCell>
                                        <TableCell>{new Date(user.created_at).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <Tooltip title="Approve">
                                                    <IconButton
                                                        sx={{ color: 'green' }}
                                                        onClick={() => handleApprove(user.id)}
                                                    >
                                                        <CheckCircleIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit">
                                                    <IconButton
                                                        sx={{ color: 'blue' }}
                                                        onClick={() => handleEdit(user.id)}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Reject">
                                                    <IconButton
                                                        sx={{ color: 'red' }}
                                                        onClick={() => openRejectModal(user.id)}
                                                    >
                                                        <CancelIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                </Box>

                {/* Edit Modal */}
                <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
                    <DialogTitle>Edit User Details</DialogTitle>
                    <DialogContent>
                        <Typography>Role:</Typography>
                        <Select
                            value={selectedRoles[editUserId] || roles[0]} // Default to first role
                            onChange={(e) =>
                                setSelectedRoles((prevRoles) => ({
                                    ...prevRoles,
                                    [editUserId]: e.target.value,
                                }))
                            }
                            fullWidth
                        >
                            {roles.map((role) => (
                                <MenuItem key={role} value={role}>
                                    {role}
                                </MenuItem>
                            ))}
                        </Select>
                        <Typography sx={{ marginTop: 2 }}>Location:</Typography>
                        <Select
                            value={selectedLocations[editUserId] || locations[0]?.id} // Default to first location
                            onChange={(e) =>
                                setSelectedLocations((prevLocations) => ({
                                    ...prevLocations,
                                    [editUserId]: e.target.value,
                                }))
                            }
                            fullWidth
                        >
                            {locations.map((location) => (
                                <MenuItem key={location.id} value={location.id}>
                                    {location.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleEditSubmit} color="primary" variant="contained">
                            Save
                        </Button>
                        <Button onClick={() => setEditModalOpen(false)} color="secondary">
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Reject Modal */}
                <Modal open={rejectModalOpen} onClose={() => setRejectModalOpen(false)}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: 'white',
                            padding: 4,
                            boxShadow: 24,
                            borderRadius: 2,
                            width: 300,
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            Reason for Rejection
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Enter the reason for rejection..."
                        />
                        <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
                            <Button
                                variant="contained"
                                sx={{ backgroundColor: 'red', color: 'white' }}
                                onClick={handleRejectSubmit}
                            >
                                Submit
                            </Button>
                            <Button variant="outlined" onClick={() => setRejectModalOpen(false)}>
                                Cancel
                            </Button>
                        </Box>
                    </Box>
                </Modal>

                {/* Logout Modal */}
                <Modal
                    open={logoutModalOpen}
                    onClose={() => setLogoutModalOpen(false)}
                    sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >
                    <Box
                        sx={{
                            backgroundColor: 'white',
                            padding: 4,
                            borderRadius: 2,
                            boxShadow: 24,
                            width: 300,
                        }}
                    >
                        <Typography variant="h5"
                            sx={{
                                fontWeight: 'bold',
                                marginBottom: 2,
                            }}>
                            Confirm Logout
                        </Typography>
                        <Typography variant="body1">
                            Are you sure you want to log out?
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={handleLogout}
                            >
                                Yes, I Confirm
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => setLogoutModalOpen(false)}
                            >
                                Cancel
                            </Button>
                        </Box>
                    </Box>
                </Modal>
            </Box>
        </Box>
    );
};

export default AdminPanel;