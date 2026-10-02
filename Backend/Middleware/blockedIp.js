import { StoreIpInDB } from "../Shema/IPwithlist.js";

export async function BlockedIp(req, res, next) {
  if (req.path === "/ip-access") {
    return next();
  }

  try {
    const ip = req.ip || req.socket.remoteAddress;
    const blocked = await StoreIpInDB.exists({ ip, block: true });

    if (blocked) {
      return res.status(404).json({
        success: false,
        blocked: true,
        message: "404 - Please contact application admin.",
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
}