import AddGrampnachaytTax from "../Shema/AddGrampanchaytTax.js";
import { saveLoginOtp, getLoginOtp, deleteLoginOtp } from "../Radias/radias.js";

import Transporter from "../EmailSetup/Email.js";
export const AddPropertyTax = async (req, res) => {
    try
    {
        
        const propertyTax = await AddGrampnachaytTax.create(req.body);

        if(!propertyTax)
        {
            return res.status(404).json({

                message: "Not Found Data"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Property tax record created successfully",
            data: propertyTax
        })

    }
    catch(error)
    {

        return res.status(500).json({

            message: "Internal Server Error"
        })
    }
}


export const UpdatePropertyTax = async (req, res) => {

    try
    {
        const propertyTax = await AddGrampnachaytTax.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if(!propertyTax)
        {
            return res.status(404).json({

                message: "Not Found Data"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Property tax record updated successfully",
            data: propertyTax
        })  

    }catch(error)
    {

        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}


export const GetAllProertyTax = async (req, res) => {

    try
    {
        const propertyTaxes = await AddGrampnachaytTax.find({ isActive: true }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Property tax records fetched successfully",
            data: propertyTaxes
        })  
    }
    catch(error)
    {

        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const getPropertyTaxByHouseNumber = async (req, res) => {
    try
    {
        const { houseNumber } = req.body;
        const propertyTax = await AddGrampnachaytTax.findOne({ houseNo: houseNumber, isActive: true }).lean();

        if(!propertyTax)
        {
            return res.status(404).json({ message: "Property Tax Record Not Found" });
        }

        return res.status(200).json({
            success: true,
            data: { email: propertyTax.email || "" }
        });
    }
    catch(error)
    {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const updatePropertyTaxStatus = async (req,res)=>{


    try
    {

        const {houseNumber,email}= req.body;

        if(!houseNumber)
        {
            return res.status(400).json({ message: "House number is required" });
        }

        const FindPropertyTax =await AddGrampnachaytTax.findOne({houseNo:houseNumber});

        /* If Property Tax Record Is Not Found */
        if(!FindPropertyTax)
        {
            return res.status(404).json({
                message:"Property Tax Record Not Found"
            })
        }

        else if(FindPropertyTax.email)
        {

            const gernrateOtp= Math.floor(100000+ Math.random()*900000);

            await saveLoginOtp(`otp:${FindPropertyTax.email}`, String(gernrateOtp), 300);

            await Transporter.sendMail({


                from: process.env.EMAIL,
                to: FindPropertyTax.email,
                subject: "OTP for Property Tax Status Update",
                text: `Your OTP for updating property tax status is: ${gernrateOtp}. It will expire in 5 minutes.`

            });

            return res.status(200).json({
                success: true,
                message: "OTP sent successfully",
                email: FindPropertyTax.email
            });

        }

        else if(!FindPropertyTax.email)
        {
            if(!email)
            {
                return res.status(400).json({ message: "Email is required for this house number" });
            }

            const UpdateEmailONHouseNumber= await AddGrampnachaytTax.findOneAndUpdate({houseNo:houseNumber},{$set:{email:email}},{new:true});

            const gernrateOtp= Math.floor(100000+ Math.random()*900000);

            await saveLoginOtp(`otp:${UpdateEmailONHouseNumber.email}`, String(gernrateOtp), 300);

            await Transporter.sendMail({

                from: process.env.EMAIL,
                to: UpdateEmailONHouseNumber.email,
                subject: "OTP for Property Tax Status Update",
                text: `Your OTP for updating property tax status is: ${gernrateOtp}. It will expire in 5 minutes.`

            });

            return res.status(200).json({
                success: true,
                message: "OTP sent successfully",
                email: UpdateEmailONHouseNumber.email
            });

        }



    }catch(error)
    {

        console.error("Property tax OTP error:", error.message);

        return res.status(500).json({

            message:"Internal Server Error"
        })
    }

}

export const VarifyOtpForPropertyTaxStatusUpdate = async (req,res)=>{

    try
    {

        const {otp,email}=req.body;

        if(!otp || !email)
        {
            return res.status(400).json({ message: "OTP and email are required" });
        }

        const VerifyOtp= await getLoginOtp(`otp:${email}`);

        if(!VerifyOtp)
        {
            return res.status(400).json({
                message:"OTP Expired"
            })
        }

        else if(VerifyOtp!==String(otp))
        {
            return res.status(400).json({
                message:"Invalid OTP"
            })
        }

        else if(VerifyOtp===String(otp))
        {
            await deleteLoginOtp(`otp:${email}`);

            const UpdatePropertyTaxStatus= await AddGrampnachaytTax.findOne({email:email});

            return res.status(200).json({
                success:true,
                message:"Property Tax Status Updated Successfully",
                data:UpdatePropertyTaxStatus
            })
        }
    }
    catch(error)
    {

        return res.status(500).json({

            message:"Internal Server Error"
        })
    }
}


export const DeletePropertyTax = async (req,res)=>{
    try
    {
        const { id } = req.params;
        const deletedPropertyTax = await AddGrampnachaytTax.deleteOne(
            { _id: id }
        );

        if (!deletedPropertyTax)
        {
            return res.status(404).json({
                success: false,
                message: "Property Tax Not Found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Property tax record deleted successfully",
            data: deletedPropertyTax
        });
    }
    catch(error)
    {
        console.error("Property tax delete error:", error);
        return res.status(500).json({
            success: false,
            message:"Unable to delete property tax record"
        });
    }
}


export const ViewPropertyTax = async (req,res)=>{


    try
    {

        const {id}= req.params;

        const ViewPropertyTax= await AddGrampnachaytTax.findById({_id:id});

        if(!ViewPropertyTax)
        {
            return res.status(404).json({
                message:"Property Tax Not Found"
            })
        }

        return res.status(200).json({
            success:true,
            data:ViewPropertyTax
        })

    }

    catch(error)
    {

        return res.status(500).json({

            message:"Internal Server Error"
        })
    }

}