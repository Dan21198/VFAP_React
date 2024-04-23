import React, { useState, useEffect } from 'react';
// @ts-ignore
import { fetchUsers, deleteUser } from './UserAPI.ts';
import { Button } from 'react-bootstrap';
import './user.css';

const UserList = () => {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await fetchUsers();
            const usersData = response.data;
            setUsers(usersData);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    const handleDeleteUser = async (userId: number) => {
        try {
            await deleteUser(String(userId));
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };


    return (
        <div className="user-list">
            {users.map(user => (
                <div key={user.id} className="user-item">
                    <div className="user-details">
                        <p>ID: {user.id}</p>
                        <p>Email: {user.email}</p>
                    </div>
                    <Button variant="danger" onClick={() => handleDeleteUser(user.id)} className="delete-button">
                        Delete
                    </Button>
                </div>
            ))}
        </div>
    );
};

export default UserList;
