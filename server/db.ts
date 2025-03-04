import axios from 'axios'; // or use axios

const DB_SERVICE_URL = process.env.DB_SERVICE_URL as string;
const DB_SERVICE_API_KEY = process.env.DB_SERVICE_API_KEY as string;

export async function getAgentSession(agent_id: string, session_id: string) {
    const apiUrl = `${DB_SERVICE_URL}/api_v1/agent_sessions/get_v2`;
    const requestBody = {
        agent_id,
        session_id
    };

    try {
        const response = await axios.post(apiUrl, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': DB_SERVICE_API_KEY
            }
        });

        console.log('API Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error calling agent_session/get_v2:', error);
        throw new Error(error instanceof Error ? error.message : 'Unknown error');
    }
}

export async function updateAgentSession(agent_id: string, session_id: string, status: string) {
    const apiUrl = `${DB_SERVICE_URL}/agent_sessions/update`;
    const requestBody = {
        agent_id,
        session_id,
        status
    };

    try {
        const response = await axios.post(apiUrl, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': DB_SERVICE_API_KEY,
            }
        });

        console.log('API Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error calling agent_session/get_v2:', error);
        throw new Error(error instanceof Error ? error.message : 'Unknown error');
    }
}

