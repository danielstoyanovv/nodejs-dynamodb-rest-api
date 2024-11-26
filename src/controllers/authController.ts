"use strict";

import { Request, Response } from "express"
import { TokenService } from "../services/TokenService"
import { 
    STATUS_SUCCESS, 
    STATUS_ERROR, 
    INTERNAL_SERVER_ERROR } from "../constants/data"
import { 
    ScanCommand  } from "@aws-sdk/lib-dynamodb";

import { DynamoDBConnect } from "../config/DynamoDBConnect";
import {config} from "dotenv"
config()

const dynamoDBConnect = new DynamoDBConnect()
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
            return res.status(401).json({ 
                status: STATUS_ERROR, 
                data: [] ,
                message: INVALID_EMAIL_PASSWORD 
            });
        }
        if (users.Items) {
            const bcrypt = require("bcrypt")
            users.Items.forEach(async function (user) {
                const result = await bcrypt.compare(password, user.password);         
                if (!result) {
                    return res.status(401).json({ 
                        status: STATUS_ERROR, 
                        data: [],
                        message: INVALID_EMAIL_PASSWORD
                    });
                }
                if (user.role !== role) {
                    return res.status(401).json({ 
                        status: STATUS_ERROR, 
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
                    token: token
                }
                res.json({
                    status: STATUS_SUCCESS, 
                    data,
                    message: ""
                });
            });            
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ 
            status: STATUS_ERROR, 
            data: [],
            message: INTERNAL_SERVER_ERROR
        });
    }
}