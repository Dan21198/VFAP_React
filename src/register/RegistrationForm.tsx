import React, { useState, FormEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegistrationForm = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const register = async (event: FormEvent<HTMLFormElement>) => { // Adjust event type
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/v1/auth/register', {
                username: username,
                email: email,
                password: password
            });
            console.log('Registration successful:', response.data);
            navigate('/login');
        } catch (error: any) {
            console.error('Failed to register:', error.response.data);
            alert('Registration failed!');
        }
    };

    return (
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
    );
};

export default RegistrationForm;
