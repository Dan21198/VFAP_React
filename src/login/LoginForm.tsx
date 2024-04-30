import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../global.css';
import './LoginForm.css';

const LoginForm = () => {
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });
    const navigate = useNavigate();

    const login = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/v1/auth/authenticate', {
                email: loginEmail,
                password: loginPassword
            });

            const accessToken = response.data.access_token;
            if (accessToken) {
                localStorage.setItem('access_token', accessToken);
                navigate('/notes');
                setSnackbar({ open: true, message: 'Login successful!' });
            } else {
                console.error('No token received');
                setSnackbar({ open: true, message: 'Authentication failed: No token received' });
            }
        } catch (error) {
            setSnackbar({ open: true, message: 'Authentication failed!' });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <div className="container mt-5">
            <form onSubmit={login} className="custom-login-form">
                <div className="mb-3">
                    <label htmlFor="login-username" className="form-label">Email:</label>
                    <input
                        type="text"
                        className="form-control"
                        id="login-username"
                        name="login-username"
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="login-password" className="form-label">Password:</label>
                    <input
                        type="password"
                        className="form-control"
                        id="login-password"
                        name="login-password"
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                    />
                </div>

                <button type="submit" className="btn btn-primary">Login</button>
                <button type="button" className="btn btn-link" onClick={() => navigate('/register')}>Register</button>
            </form>
            {snackbar.open && (
                <div className="alert alert-info mt-3" role="alert">
                    {snackbar.message}
                    <button type="button" className="close" onClick={handleCloseSnackbar}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default LoginForm;
