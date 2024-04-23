import axios, { AxiosResponse } from 'axios';

const API_URL = 'http://localhost:8080/api/v1/tags';

const getToken = (): string => {
    return `Bearer ${localStorage.getItem('access_token')}`;
};

export const fetchTags = async (): Promise<AxiosResponse> => {
    return axios.get(API_URL, {
        headers: {
            Authorization: getToken()
        }
    });
};

export const createTag = async (tagName: string): Promise<AxiosResponse> => {
    return axios.post(API_URL, { name: tagName }, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: getToken()
        }
    });
};

export const deleteTag = async (tagId: string): Promise<AxiosResponse> => {
    return axios.delete(`${API_URL}/${tagId}`, {
        headers: {
            Authorization: getToken()
        }
    });
};

export const assignTagToNote = async (tagId: string, noteId: string): Promise<AxiosResponse> => {
    return axios.put(`${API_URL}/${tagId}/assign/${noteId}`, {}, {
        headers: {
            Authorization: getToken()
        }
    });
};

export const removeTagFromNote = async (tagId: string, noteId: string): Promise<AxiosResponse> => {
    return axios.put(`${API_URL}/${tagId}/remove/${noteId}`, {}, {
        headers: {
            Authorization: getToken()
        }
    });
};
