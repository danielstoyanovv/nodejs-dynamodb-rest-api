"use strict";

import { Request, Response } from "express"
import { TokenService } from "../services/TokenService"
import {
    MESSEGE_SUCCESS,
    MESSEGE_ERROR,
    MESSEGE_INTERNAL_SERVER_ERROR,
    STATUS_INTERNAL_SERVER_ERROR,
    STATUS_UNAUTHORIZED
} from "../constants/data"
import { 
    ScanCommand  } from "@aws-sdk/lib-dynamodb";

import { ConnectToDatabase } from "../config/ConnectToDatabase";
import {config} from "dotenv"
config()

const dynamoDBConnect = new ConnectToDatabase()
const docClient = dynamoDBConnect.getDocumentClient
const TABLE_NAME = process.env.DYNAMODB_USERS_TABLE_NAME

export const loginUser = async ( req: Request,  res: Response) => {
    const { email, password, role } = req.body;
    const INVALID_EMAIL_PASSWORD = "Invalid email or password";
    try {
        const command = new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: "email = :e",
            ExpressionAttributeValues: {
                ":e": email
            }
        });
        const users = await docClient.send(command)
        if (users.Count === 0) {
            return res.status(STATUS_UNAUTHORIZED).json({
                status: MESSEGE_ERROR,
                data: [] ,
                message: INVALID_EMAIL_PASSWORD 
            });
        }
        if (users.Items) {
            const bcrypt = require("bcrypt")
            users.Items.forEach(async function (user) {
                const result = await bcrypt.compare(password, user.password);         
                if (!result) {
                    return res.status(STATUS_UNAUTHORIZED).json({
                        status: MESSEGE_ERROR,
                        data: [],
                        message: INVALID_EMAIL_PASSWORD
                    });
                }
                if (user.role !== role) {
                    return res.status(STATUS_UNAUTHORIZED).json({
                        status: MESSEGE_ERROR,
                        data: [],
                        message: "Invalid role" 
                    });
                }
                const token = new TokenService()
                    .setUserId(user._id)
                    .setUserEmail(email)
                    .setUserRole(role)
                    .getToken
                const data = {
                    logged_user_id: user._id,
                    token: token
                }
                res.json({
                    status: MESSEGE_SUCCESS,
                    data,
                    message: ""
                });
            });            
        }
    } catch (error) {
        console.error(error)
        res.status(STATUS_INTERNAL_SERVER_ERROR).json({
            status: MESSEGE_ERROR,
            data: [],
            message: MESSEGE_INTERNAL_SERVER_ERROR
        });
    }
}