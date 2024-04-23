import axios, { AxiosResponse } from 'axios';
import {Note} from "../model/Note";


const API_URL = 'http://localhost:8080/api/v1/notes';

const getToken = (): string => {
    return `Bearer ${localStorage.getItem('access_token')}`;
};

export const fetchNotesByFinishedStatus = async (finished: boolean): Promise<Note[]> => {
    const headers = {
        Authorization: getToken()
    };
    try {
        const response = await axios.get(`${API_URL}/finished/${finished}`, { headers });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchNotesByTag = async (tagId: number): Promise<Note[]> => {
    const headers = {
        Authorization: getToken()
    };
    try {
        const response = await axios.get(`${API_URL}/tag/${tagId}`, { headers });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchAllNotes = async (): Promise<AxiosResponse<Note[]>> => {
    const headers = {
        Authorization: getToken()
    };
    try {
        return await axios.get<Note[]>(API_URL, { headers });
    } catch (error) {
        throw error;
    }
};

export const createNote = async (note: Note): Promise<AxiosResponse<Note>> => {
    const headers = {
        'Content-Type': 'application/json',
        Authorization: getToken()
    };
    try {
        return await axios.post<Note>(API_URL, note, { headers });
    } catch (error) {
        throw error;
    }
};

export const updateNote = async (noteId: number, note: Note): Promise<AxiosResponse<Note>> => {
    const headers = {
        'Content-Type': 'application/json',
        Authorization: getToken()
    };
    try {
        return await axios.put<Note>(`${API_URL}/${noteId}`, note, { headers });
    } catch (error) {
        throw error;
    }
};

export const deleteNote = async (noteId: number): Promise<void> => {
    const headers = {
        Authorization: getToken()
    };
    try {
        await axios.delete(`${API_URL}/${noteId}`, { headers });
    } catch (error) {
        throw error;
    }
};
