import React, { useState, FormEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './RegistrationForm.css';

const RegistrationForm = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', variant: '' });
    const navigate = useNavigate();

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const register = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/v1/auth/register', {
                userName: username,
                email: email,
                password: password
            });
            navigate('/login');
        } catch (error: any) {
            setSnackbar({ open: true, message: 'Registration failed!', variant: 'error' });
        }
    };

    return (
        <div className="registration-container">
            <form onSubmit={register} className="custom-registration-form">
                <label htmlFor="username">Username:</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="form-control"
                />

                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="form-control"
                />

                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="form-control"
                />

                <div className="text-center mt-4">
                    <button type="submit" className="btn btn-primary">Register</button>
                </div>
            </form>
            {snackbar.open && (
                <div className="snackbar" role="alert">
                    {snackbar.message}
                    <button type="button" className="close" onClick={handleCloseSnackbar}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default RegistrationForm;
