
import mongoose from "mongoose";

const IPSchma= new mongoose.Schema({

    ip:{

        type:"String"
    },

    block:{

        type:Boolean,
        default:false
    }
});

export const StoreIpInDB= mongoose.model("ips",IPSchma);