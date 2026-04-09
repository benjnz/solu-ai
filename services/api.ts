import { auth } from '../firebaseConfig';
import { getCompanies, getMicroTasks, completeMicroTask } from './db';

export { getCompanies, getMicroTasks, completeMicroTask };

const API_BASE_URL = "https://us-central1-soluaiblueprint-62038680-8d4ee.cloudfunctions.net";

// A function to get the auth token
const getAuthToken = async () => {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
};

// A wrapper for fetch that includes the auth token
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const token = await getAuthToken();

    const headers = {
        ...options.headers,
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error (${response.status}): ${errorText}`);
    }

    return response.json();
};

// Specific API calls

export const generateBlueprintFromJobDescription = async (jobDescription: string) => {
    const url = `${API_BASE_URL}/generateBlueprint`;
    const options = {
        method: 'POST',
        body: JSON.stringify({ data: { jobDescription } }),
    };
    return authenticatedFetch(url, options);
};

export const evaluateWorkflow = async (payload: any) => {
    const url = `${API_BASE_URL}/evaluateWorkflow`;
    const options = {
        method: 'POST',
        body: JSON.stringify({ data: payload }),
    };
    return authenticatedFetch(url, options);
};
