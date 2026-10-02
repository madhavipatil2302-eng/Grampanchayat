import {createClient} from 'redis';
import dotenv from "dotenv";

dotenv.config();

export  const redisClient = createClient({


    url:process.env.REDIS_URL

});

const memoryStore = new Map();
let redisReady = false;

redisClient.on("error", (error) => {
    if (redisReady) {
        console.log("Redis error:", error.message || error.code || error);
    }
    redisReady = false;
});

const connectRedis = async()=>{
    try {
        await redisClient.connect();
            redisReady = true;
        console.log("Redis Connected Successfully");
    } catch (error) {
            console.log("Redis unavailable. Using temporary in-memory OTP storage for this server session.");
    }
};

connectRedis();

export default redisClient;

export async function saveLoginOtp(key, otp, ttlSeconds) {
    if (redisReady) {
        return redisClient.setEx(key, ttlSeconds, otp);
    }

    memoryStore.set(key, {
        otp,
        expiresAt: Date.now() + ttlSeconds * 1000,
    });
}

export async function getLoginOtp(key) {
    if (redisReady) {
        return redisClient.get(key);
    }

    const saved = memoryStore.get(key);
    if (!saved || saved.expiresAt <= Date.now()) {
        memoryStore.delete(key);
        return null;
    }

    return saved.otp;
}

export async function deleteLoginOtp(key) {
    if (redisReady) {
        return redisClient.del(key);
    }

    memoryStore.delete(key);
}

