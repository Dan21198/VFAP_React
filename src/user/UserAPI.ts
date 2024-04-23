import axios, {AxiosResponse} from 'axios';

const API_URL = 'http://localhost:8080/api/v1/users';

const getToken = (): string => {
    return `Bearer ${localStorage.getItem('access_token')}`;
};

export const fetchUsers = async (): Promise<AxiosResponse<User[]>> => {
    const headers = {
        Authorization: getToken()
    };
    try {
        return await axios.get<User[]>(API_URL, {headers});
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};


export const createUser = async (user: User): Promise<AxiosResponse<User>> => {
    const headers = {
        'Content-Type': 'application/json',
        Authorization: getToken()
    };
    try {
        return await axios.post<User>(API_URL, user, {headers});
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

export const updateUser = async (userId: string, user: User): Promise<AxiosResponse<User>> => {
    const headers = {
        'Content-Type': 'application/json',
        Authorization: getToken()
    };
    try {
        return await axios.put<User>(`${API_URL}/${userId}`, user, {headers});
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

export const deleteUser = async (userId: string): Promise<void> => {
    const headers = {
        Authorization: getToken()
    };
    try {
        await axios.delete(`${API_URL}/${userId}`, { headers });
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};
