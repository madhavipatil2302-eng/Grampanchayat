import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";
dotenv.config();


const apikey= new GoogleGenAI({

    apiKey:process.env.GOOGLE_GEMINI_KEY
});


export const UserAI=async (req,res)=>{

    const {qun}=req.body;

    if (!qun) {
        return res.status(400).json({
            success: false,
            message: "Question is required",
        });
    }

    const response= await  apikey.models.generateContent({

        model:'gemini-2.5-flash',
        contents:`${qun}`
    });

    if(response)
    {

        return res.status(200).json({

            success: true,
            message:"User Response Is",
            data:response.text
        })
    }

}
