"use strict";

import { Request, Response } from "express"
import jwt from 'jsonwebtoken'
import { STATUS_SUCCESS, STATUS_ERROR, INTERNAL_SERVER_ERROR } from "../config/data"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand  } from "@aws-sdk/lib-dynamodb";
import {config} from "dotenv"
config()

const client = new DynamoDBClient({
    region: "eu-west-3"
});
const docClient = DynamoDBDocumentClient.from(client)
const TABLE_NAME = process.env.USERS_TABLE_NAME

export const loginUser = async ( req: Request,  res: Response) => {
    const { email, password, role } = req.body;
    const INVALID_EMAIL_PASSWORD = "Invalid email or password";
    try {
        // result.data.Item.id.S,
        const command = new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: "email = :e",
            ExpressionAttributeValues: {
                ":e": email
            }
        });
        const users = await client.send(command)
        console.log(users.Count)

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
                console.log(user)
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
                const token = jwt.sign({
                    id: user._id,
                    email: email,
                    role: role
                }, process.env.JWT_SECRET!, {
                    expiresIn: 180
                });
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
        console.log(error)
        res.status(500).json({ 
            status: STATUS_ERROR, 
            data: [],
            message: INTERNAL_SERVER_ERROR
        });
    }
}