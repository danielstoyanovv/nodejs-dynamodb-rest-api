"use strict";

import {Request, Response, NextFunction } from "express";
import { STATUS_SUCCESS } from "../constants/data"
import {RedisServerService} from "../services/RedisServerService";
export const getUsersFromCacheMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const redisClient = new RedisServerService().getRedisClient
    const cachedData = await redisClient.get("users");
    if (cachedData) {
        const users = JSON.parse(cachedData)
        console.log('Cache hit');
        return res.status(200).json({
            status: STATUS_SUCCESS,
            data: {
                users,
                "total" : users.length
            },
            message: ""
        })
    }
    console.log('Cache miss');
    next();
}