
import { BASE_URL } from './apiConfig'


export const UserAI=async (qun)=>{


    try{


        const response= await fetch(`${BASE_URL}/api/user-ai`,{

            method:"POST",

            headers:{

         "Content-Type": "application/json",
         
            },

            body:JSON.stringify({qun})
        })

        const result= await response.json();

        return result;
    }

    catch(error)
    {


        return console.log(error);
    }

}
