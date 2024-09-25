import {Request, Response, NextFunction } from "express";
import {config} from "dotenv"
config()
import { STATUS_ERROR } from "../config/data"
import jwt from 'jsonwebtoken'

export const VerifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.body.token || req.query.token || req.headers['x-access-token'] || false
    if (!token) {
        return res.status(403).json({
            status: STATUS_ERROR, 
            data: [],
            message: "No token provided."
        });
    }
    if (token) {
        try {
            const payloadBase64 = token.split('.')[1];
            const decodedJson = Buffer.from(payloadBase64, 'base64').toString();
            const decoded = JSON.parse(decodedJson)
            const exp = decoded.exp;
            const expired = (Date.now() >= exp * 1000)
            if (expired) {
                return res.status(401).json({
                    status: STATUS_ERROR, 
                    data: [],
                    message: "Unauthorized access."
                });
            }
            const tokenData = jwt.verify(token, process.env.JWT_SECRET!, {})
            const isAdmin = Object.values(tokenData).includes("admin");
            if (!isAdmin) {
                return res.status(401).json({
                    status: STATUS_ERROR, 
                    data: [],
                    message: "Unauthorized access - admins access required." 
                });
            }
        } catch(error) {
            console.log(error)    
        }
    }
    next();
}
