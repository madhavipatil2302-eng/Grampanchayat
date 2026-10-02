import { EmergencyContactModel } from "../Shema/EmergencyContactModel.js";
import { OfficialEmergencyContactModel } from "../Shema/OfficialEmergencyContactModel.js";
import LoginModel from "../Shema/loginSchma.js";
import Transpoter from "../EmailSetup/Email.js";

export const GetEmergencyContact = async (req, res) => {

    try {

        const { emrgencycontact, contact, name, latitude, longitude, email, officialEmail } = req.body;

        if (!emrgencycontact || !contact || !name || !latitude || !longitude || !email) {

            return res.status(400).json({

                message: "All fields are required"
            });

        }
        let fileUrl = "";
        if (req.file) {
            fileUrl = req.file.location || `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        }

        const Response = await EmergencyContactModel.create({
            emrgencycontact: emrgencycontact,
            contact: contact,
            name: name,
            latitude: latitude,
            longitude: longitude,
            fileUrl: fileUrl,
        });

        if (!Response) {
            return res.status(500).json({
                message: "Internal Server Error"
            })
        }
        if (Response) {

            try {
                let toEmails = email;
                
                if (officialEmail) {
                    toEmails = [email, officialEmail].join(',');
                } else {
                    const officialContacts = await OfficialEmergencyContactModel.find({});
                    const officialEmails = officialContacts.map(c => c.email).filter(e => e);
                    toEmails = [email, ...officialEmails].join(',');
                }

                let emailText = `EMERGENCY ALERT!\n\nName: ${name}\nContact: ${contact}\nEmergency Contact Provided: ${emrgencycontact}\n\nLive Location: https://www.google.com/maps?q=${latitude},${longitude}\n\nPlease take immediate action.`;
                
                if (fileUrl) {
                    emailText += `\n\nAttached Evidence: ${fileUrl}`;
                }

                const findAllLoginUser= await LoginModel.find();
                
        
                const GetAllEmails= findAllLoginUser.map((user)=>{


                    return user.email;
                });

                console.log("AllAdminEmails:", GetAllEmails);

                if(latitude==17.6125369 && longitude==76.1543119){

                     await Transpoter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: GetAllEmails,
                    subject: "URGENT: Emergency Contact Alert",
                    text: emailText
                });

                }
                else{

                    return res.status(400).json({

                        message:"Sorry You Are Not In Your Area We are not help You"
                    })
                }

               
            } catch (emailError) {
                console.error("Email Error:", emailError);
            }

            return res.status(200).json({
                message: "Emergency Contact Added Successfully",
                data: Response
            })
        }
    }
    catch (error) {
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const AddOfficialEmergencyContact = async (req, res) => {
    try {
        const { serviceType, name, contactNumber, email } = req.body;

        if (!serviceType || !name || !contactNumber || !email) {
            return res.status(400).json({ message: "All fields are required" });
        }

        let image = "";
        if (req.file) {
            image = req.file.location || `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        }

        const newContact = await OfficialEmergencyContactModel.create({
            serviceType,
            name,
            contactNumber,
            email,
            image
        });

        return res.status(201).json({
            message: "Official Emergency Contact Added Successfully",
            data: newContact
        });
    } catch (error) {
        console.error("AddOfficialEmergencyContact Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const GetOfficialEmergencyContacts = async (req, res) => {
    try {
        const contacts = await OfficialEmergencyContactModel.find({});
        return res.status(200).json({
            message: "Fetched Successfully",
            data: contacts
        });
    } catch (error) {
        console.error("GetOfficialEmergencyContacts Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const GetAllEmergencyAlerts = async (req, res) => {
    try {
        const alerts = await EmergencyContactModel.find({}).sort({ _id: -1 });
        return res.status(200).json({
            message: "Fetched Successfully",
            data: alerts
        });
    } catch (error) {
        console.error("GetAllEmergencyAlerts Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};