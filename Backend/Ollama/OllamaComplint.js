
import ollama from "ollama";
import Upload from "../multer/multer.js";



const OllamaComplint = async (req, res) => {


    try {

        const file = req.file ? req.file.filename : null;

        const { complint, description, category, name, email, contact } = req.body;



        if (!complint || !description || !category || !name || !email || !contact) {

            return res.status(400).json({

                success: false,
                message: "All fields are required"
            })
        }

        const response = await ollama.chat({

            model: "llama3.2:3b",
            messages: [
                {
                    role: "user",
                    content: `
You are a precise and accurate AI assistant.
Read the full question carefully and answer exactly what the user asked.
Do not give vague filler.
For simple questions, answer directly in 1 to 3 lines.
For broad questions, give a useful answer with clear bullet points.
Use the language requested by the user.

User question:
${complint}
`
                }
            ]
        });

    } catch (err) {

        return res.status(400).json({


            success: false,
            message: "Internal Server Error"
        })
    }
}