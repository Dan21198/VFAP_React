import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './login/LoginForm.tsx';
import RegistrationForm from './register/RegistrationForm.tsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from "./header/Header.tsx";
import TagComponent from "./tag/TagComponent.tsx";
import UserList from "./user/UserList.tsx";
import Note from "./note/Note.tsx";


function App() {
    return (
        <BrowserRouter>
            <div className="App">
                <Header />
                <Routes>
                    <Route path="/" element={<Navigate replace to="/login" />} />
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/register" element={<RegistrationForm />} />
                    <Route path="/notes" element={<Note />} />
                    <Route path="/tags" element={<TagComponent />} />
                    <Route path="/user-settings" element={<UserList />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}
export default App;
