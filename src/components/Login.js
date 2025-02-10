import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Paper, Grid, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    document.title = 'Autolec | Login Panel';
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/login', { email, password });

            if (response.status === 200) {
                const { name, role } = response.data;

                // Save user info in localStorage
                localStorage.setItem('userName', name);
                localStorage.setItem('userRole', role);
                localStorage.setItem('userEmail', email);

                // Redirect to dashboard for all roles, including Admin
                navigate('/dashboard');
            } else {
                alert('Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error('Login error:', err.response?.data?.message || err.message);
            alert(err.response?.data?.message || 'An error occurred during login.');
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: '#f5f5f5',
            }}
        >
            <Paper elevation={3} sx={{ padding: 4, maxWidth: 800, width: '100%', borderRadius: '16px' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <Box sx={{ textAlign: 'center' }}>
                            <img
                                src={require('../assets/login.png')}
                                alt="Attendance System"
                                style={{ maxWidth: '100%', borderRadius: '8px' }}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h5" gutterBottom align="center">
                            Login
                        </Typography>
                        <form onSubmit={handleLogin}>
                            <TextField
                                label="Email"
                                fullWidth
                                margin="normal"
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
                            <Box sx={{ mt: 2 }}>
                                <Button type="submit" variant="contained" color="primary" fullWidth>
                                    Login
                                </Button>
                            </Box>
                        </form>
                        <Typography sx={{ mt: 2 }} align="center">
                            Not registered?{' '}
                            <Link href="/register" underline="none" color="primary">
                                Register Here
                            </Link>
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default Login;