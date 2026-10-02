import mongoose from "mongoose";

const QRCodeSchema = new mongoose.Schema({


    qr:{

        type:String
    },
    upiId: {
        type: String,
        trim: true,
        lowercase: true
    },
    amount: {
        type: Number,
        min: 0
    },
    propertyTaxId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AddGrampnachaytTax"
    },
    transactionId: {
        type: String,
        trim: true
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    createAT:{

        type:Date,
        default:Date.now()
    }

});

export const QRCodeModel= mongoose.model("qrscnners",QRCodeSchema);
