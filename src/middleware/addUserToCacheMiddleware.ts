"use strict";

import {Request, Response, NextFunction } from "express";
import {STATUS_SUCCESS} from "../constants/data"
import {RedisServerService} from "../services/RedisServerService";

export const addUserToCacheMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const cacheKey = "user_" + id
    const redisClient = new RedisServerService().getRedisClient
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        const user = JSON.parse(cachedData)
        console.log('Cache hit');
        return res.status(200).json({
            status: STATUS_SUCCESS,
            data: user,
            message: ""
        })
    }
    console.log('Cache miss');
    next();
}