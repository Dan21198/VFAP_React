import React, {FormEvent, useState} from 'react';
import axios from 'axios';
import { useNavigate  } from 'react-router-dom';

const LoginForm = () => {
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const navigate = useNavigate()

    const login = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/v1/auth/authenticate', {
                email: loginEmail,
                password: loginPassword
            });
            console.log('Authentication successful:', response.data);

            const accessToken = response.data.access_token;
            if (accessToken) {
                localStorage.setItem('access_token', accessToken);
                navigate('/notes');
            } else {
                console.error('No token received');
                alert('Authentication failed: No token received');
            }
        } catch (error: any) {
            console.error('Failed to authenticate:', error.response ? error.response.data : 'No response');
            alert('Authentication failed!');
        }
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
        </div>
    );
};

export default LoginForm;