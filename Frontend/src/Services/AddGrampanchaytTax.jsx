

const envBaseUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.BACKEND_URL;
const BASE_URL = envBaseUrl && !envBaseUrl.includes('5001') ? envBaseUrl : 'http://localhost:8000';


export const AddGrampanchaytTax= async (data)=>{

    try
    {
        const Response= await fetch(`${BASE_URL}/api/grampanchayat/add-property-tax`,{

            method: "POST",
            headers:{

                "Content-type":"application/json",
            },
            body:JSON.stringify(data)
        })

        const res = await Response.json();
        if (!Response.ok) throw new Error(res.message || 'Unable to add property tax');
        return res;

    }
    catch(error)
    {

        throw error;
    }

}

export const GetAllGrampanchatTax= async()=>{

    try
    {

        const Response= await fetch(`${BASE_URL}/api/grampanchayat/get-property-tax`,{

            method:"GET"
        });

        const res = await Response.json();
        if (!Response.ok) throw new Error(res.message || 'Unable to fetch property tax');
        return res;


    }catch(error)
    {

        throw error;
    }
}


export const UpdateGrampanchaytTax = async (id, data) => {

    try
    {

        const Response = await fetch(`${BASE_URL}/api/grampanchayat/update-property-tax/${id}`,{

            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),

        })

        const res = await Response.json();
        if (!Response.ok) throw new Error(res.message || 'Unable to update property tax');
        return res;

    }
    catch(error)
    {

        throw error;
    }
}

async function propertyTaxRequest(path, data, fallbackMessage, allowedStatusCodes = []) {
    const response = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })

    const result = await response.json()
    if (!response.ok && !allowedStatusCodes.includes(response.status)) {
        throw new Error(result.message || fallbackMessage)
    }
    return result
}

export const LookupPropertyTax = (houseNumber) => propertyTaxRequest(
    '/api/grampanchayat/property-tax/lookup',
    { houseNumber },
    'Unable to find property tax record',
)

export const SendPropertyTaxOtp = (data) => propertyTaxRequest(
    '/api/grampanchayat/property-tax/send-otp',
    data,
    'Unable to send OTP',
)

export const VerifyPropertyTaxOtp = (data) => propertyTaxRequest(
    '/api/grampanchayat/property-tax/verify-otp',
    data,
    'Unable to verify OTP',
)

export const CreatePropertyTaxPaymentOrder = (data) => propertyTaxRequest(
    '/api/grampanchayat/property-tax/payment/order',
    data,
    'Unable to create payment order',
)

export const VerifyPropertyTaxPayment = (data) => propertyTaxRequest(
    '/api/grampanchayat/property-tax/payment/verify',
    data,
    'Unable to verify payment',
    [202],
)

export const GetPropertyTaxIdDelete= async(id)=>{
    const response = await fetch(`${BASE_URL}/api/grampanchayat/property-tax-delete/${id}`, {
        method: "DELETE",
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || 'Unable to delete property tax record');
    }
    return result;
}


export const GetPropertyTaxIdView = async (id) => {
    const response = await fetch(`${BASE_URL}/api/grampanchayat/property-tax/${id}`, {
        method: "GET",
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || 'Unable to fetch property tax record');
    }
    return result;
}

