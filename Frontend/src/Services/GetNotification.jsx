
const envBaseUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.BACKEND_URL
const BASE_URL = envBaseUrl && !envBaseUrl.includes('5001') ? envBaseUrl : 'http://localhost:8000'
export const GetAllNotification = async () => {

    try {

        const Response = await fetch(`${BASE_URL}/api/get-all-notification-complints`);

        const Data = await Response.json();

        return Data;
    }
    catch (error) {


        return error;
    }
}