import ratelimiting from 'express-rate-limit';
import { StoreIpInDB } from "../Shema/IPwithlist.js";

export const Ratelimiting = ratelimiting({

    windowMs:1 * 60 * 1000,
    max:3,
    handler: async (req, res, next, options) => {
      try {
        const ip = req.ip || req.socket.remoteAddress;
        const result = await StoreIpInDB.updateMany({ ip }, { $set: { block: true } });

        if (result.matchedCount === 0) {
          await StoreIpInDB.create({ ip, block: true });
        }
      } catch (error) {
        console.error("Unable to block rate-limited IP", error);
      }

      return res.status(options.statusCode).json(options.message);
    },
      message: {
    success: false,
    message: "Too many requests, please try again later."
  }

});

