
import ComplintModel from "../Shema/Complient.js";


export const GetAllNotificationComplints = async (req, res) => {

    try {

        const GetAllNotificationComplints = await ComplintModel.find();
        if (!GetAllNotificationComplints) {

            return res.status(404).json({

                message: "Not Found Data"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Data Will Be Find",
            data: GetAllNotificationComplints
        })


    }

    catch (error) {

        return res.status(500).json({

            message: "Internal Server Error"
        })
    }
}