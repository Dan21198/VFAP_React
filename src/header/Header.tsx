import React from "react";
import { useNavigate } from 'react-router-dom';
// @ts-ignore
import DropdownMenu from './DropdownMenu.tsx';
import axios from 'axios';
import './Header.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Button} from "react-bootstrap";

const Header = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await axios.post('http://localhost:8080/api/v1/auth/logout');
            console.log('Logout successful:', response.data);

            localStorage.removeItem('access_token');

            navigate('/');
        } catch (error: any) {
            console.error('Failed to logout:', error.response ? error.response.data : 'No response');
        }
    };


    return (
        <nav className="navbar-custom">
            <div className="header-content">
                <a className="navbar-brand-custom" href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>VFAP</a>
                <div className="menu-and-logout">
                    <DropdownMenu />
                    <Button variant="link" className="logout-icon" onClick={handleLogout}>
                        <i className="bi-box-arrow-right"></i>
                        Logout
                    </Button>
                </div>
            </div>
        </nav>
    );
};

export default Header;
