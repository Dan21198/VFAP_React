import { useNavigate } from 'react-router-dom';
import './Header.css';
import Dropdown from 'react-bootstrap/Dropdown';
import 'bootstrap-icons/font/bootstrap-icons.css';
import React from "react";


const DropdownMenu = () => {
    const navigate = useNavigate();

    return (
        <Dropdown>
            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                <i className="bi bi-list"></i>
            </Dropdown.Toggle>

            <Dropdown.Menu>
                <Dropdown.Item onClick={() => navigate('/tags')}>
                    <i className="bi bi-tag"></i> Tag
                </Dropdown.Item>
                <Dropdown.Item onClick={() => navigate('/notes')}>
                    <i className="bi bi-journal-text"></i> Notes
                </Dropdown.Item>
                <Dropdown.Item onClick={() => navigate('/user-settings')}>
                    <i className="bi bi-gear-fill"></i> User Settings
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default DropdownMenu;