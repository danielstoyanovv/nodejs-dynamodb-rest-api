"use strict";

import {Request, Response, NextFunction } from "express";
import {
    MESSEGE_SUCCESS,
    STATUS_OK
} from "../constants/data"
import {RedisServerService} from "../services/RedisServerService";

export const getUserFromCacheMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const cacheKey = "user_" + id
    const redisClient = new RedisServerService().getRedisClient
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        const user = JSON.parse(cachedData)
        console.log('Cache hit');
        return res.status(STATUS_OK).json({
            status: MESSEGE_SUCCESS,
            data: user,
            message: ""
        })
    }
    console.log('Cache miss');
    next();
}