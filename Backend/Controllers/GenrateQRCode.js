import QRCode from "qrcode"
import { QRCodeModel } from "../Shema/QRCode.js";
import AddGrampnachaytTax from "../Shema/AddGrampanchaytTax.js";

const getSavedUpiId = (record) => {
    if (record?.upiId) return record.upiId;
    if (!record?.qr?.startsWith("upi://pay?")) return undefined;

    try {
        return new URL(record.qr).searchParams.get("pa") || undefined;
    } catch {
        return undefined;
    }
};

export const GetQRCode = async (req,res)=>{

    try
    {

        const savedUpiRecords = await QRCodeModel.find({}).sort({ createAT: -1 }).limit(20);
        const savedUpiId = savedUpiRecords.map(getSavedUpiId).find(Boolean);
        const input = req.body?.upiid || req.body?.url || process.env.PROPERTY_TAX_UPI_ID || savedUpiId;

        if(!input || typeof input !== "string" || !input.trim())
        {
            return res.status(400).json({
                message: "A valid URL or UPI ID is required"
            });
        }

        const trimmedInput = input.trim();
        const isUpiRequest = Boolean(req.body?.upiid) || /^[^\s@]+@[^\s@]+$/.test(trimmedInput.replace(/^https?:\/\//i, ""));
        let value = trimmedInput;
        let upiId;
        let amount;

        if (isUpiRequest) {
            upiId = trimmedInput.replace(/^https?:\/\//i, "");
            if (!/^[A-Za-z0-9._-]{2,256}@[A-Za-z0-9.-]{2,64}$/.test(upiId)) {
                return res.status(400).json({
                    message: "Enter a valid UPI ID, for example 9876543210@upi"
                });
            }

            amount = req.body?.amount;
            if (amount !== undefined && amount !== "" && (!/^\d+(\.\d{1,2})?$/.test(String(amount)) || Number(amount) <= 0)) {
                return res.status(400).json({
                    message: "Amount must be a positive number with up to two decimals"
                });
            }

            const paymentParams = new URLSearchParams({
                pa: upiId,
                pn: "Grampanchayat",
                cu: "INR"
            });
            if (amount !== undefined && amount !== "") paymentParams.set("am", Number(amount).toFixed(2));
            value = `upi://pay?${paymentParams.toString()}`;
        }

        const qrRecord = await QRCodeModel.create({
            qr: value,
            upiId,
            amount: amount === undefined || amount === "" ? undefined : Number(amount),
            propertyTaxId: req.body?.propertyTaxId || undefined
        });

        if (upiId && req.body?.propertyTaxId) {
            await AddGrampnachaytTax.findByIdAndUpdate(req.body.propertyTaxId, {
                $set: { upiId }
            });
        }

        const qrBuffer= await QRCode.toBuffer(value.trim(),{

    type: "png",
      width: 500,
      margin: 2,
      errorCorrectionLevel: "H"
        });

         // Tell browser that this is an image
    res.setHeader("Content-Type", "image/png");

        res.setHeader("Content-Disposition", 'inline; filename="grampanchayat-website-qr.png"');

    res.setHeader("X-QR-Record-Id", qrRecord._id.toString());
    if (qrRecord.upiId) res.setHeader("X-QR-UPI-ID", qrRecord.upiId);
    res.send(qrBuffer);

   
    }catch(error)
    {

        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}