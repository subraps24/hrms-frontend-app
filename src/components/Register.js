import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Box,
    Typography,
    Paper,
    Link,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
} from '@mui/material';
import axios from 'axios';

const Register = () => {
    document.title = 'Autolec | Registration Panel';
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [locationId, setLocationId] = useState('');
    const [locations, setLocations] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch available locations from the backend
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/locations');
                setLocations(response.data);
            } catch (err) {
                console.error('Failed to fetch locations:', err);
                setError('Could not load locations. Please try again later.');
            }
        };
        fetchLocations();
    }, []);

    // Handle form submission
    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        // Validation
        if (!role || !locationId) {
            setError('Please select a valid role and location.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/register', {
                name,
                email,
                password,
                role,
                location_id: locationId,
            });

            if (response.status === 201) {
                setMessage('Registration request submitted. Await admin approval.');
                resetForm();
            } else {
                setError('Registration failed. Try again.');
            }
        } catch (err) {
            if (err.response?.status === 409) {
                setError('This email is already registered.');
            } else {
                setError('An error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Reset form fields
    const resetForm = () => {
        setTimeout(() => {
            setName('');
            setEmail('');
            setPassword('');
            setRole('');
            setLocationId('');
            setMessage('');
        }, 3000);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: '#f5f5f5',
                padding: 2,
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    padding: 4,
                    maxWidth: 400,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography variant="h5" gutterBottom>
                    Register
                </Typography>
                <form onSubmit={handleRegister} style={{ width: '100%' }}>
                    <TextField
                        label="Name"
                        fullWidth
                        margin="normal"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <TextField
                        label="Email"
                        fullWidth
                        margin="normal"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <FormControl fullWidth margin="normal" required>
                        <InputLabel>Role</InputLabel>
                        <Select value={role} onChange={(e) => setRole(e.target.value)}>
                            <MenuItem value="HR">HR</MenuItem>
                            <MenuItem value="Manager">Manager</MenuItem>
                            <MenuItem value="Sr. Manager">Sr. Manager</MenuItem>
                            <MenuItem value="Department Head">Department Head</MenuItem>
                            <MenuItem value="Accounts Head">Accounts Head</MenuItem>
                            <MenuItem value="CFO">CFO</MenuItem>
                            <MenuItem value="CEO">CEO</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal" required>
                        <InputLabel>Location</InputLabel>
                        <Select
                            value={locationId}
                            onChange={(e) => setLocationId(e.target.value)}
                        >
                            {locations.map((location) => (
                                <MenuItem key={location.id} value={location.id}>
                                    {location.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Box sx={{ mt: 2 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Submit for Approval'}
                        </Button>
                    </Box>
                </form>
                {message && (
                    <Typography sx={{ mt: 2 }} color="green">
                        {message}
                    </Typography>
                )}
                {error && (
                    <Typography sx={{ mt: 2 }} color="red">
                        {error}
                    </Typography>
                )}
                <Typography sx={{ mt: 2 }}>
                    Already registered?{' '}
                    <Link href="/" underline="none" color="primary">
                        Login Here
                    </Link>
                </Typography>
            </Paper>
        </Box>
    );
};

export default Register;