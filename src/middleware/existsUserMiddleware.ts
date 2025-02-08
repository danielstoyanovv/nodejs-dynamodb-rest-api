"use strict";

import {
    MESSEGE_ERROR,
    STATUS_BAD_REQUEST
} from "../constants/data"
import { 
     ScanCommand  } from "@aws-sdk/lib-dynamodb";
import {
    Request, 
    Response, 
    NextFunction } from "express";
import {config} from "dotenv"
import { ConnectToDatabase } from "../config/ConnectToDatabase";
config()

const dynamoDBConnect = new ConnectToDatabase()
const docClient = dynamoDBConnect.getDocumentClient
const TABLE_NAME = process.env.DYNAMODB_USERS_TABLE_NAME

export async function existsUserMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const email = req.body.email;
        const command = new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: "email = :e",
            ExpressionAttributeValues: {
                ":e": email
            }
        });
        const existsUser = await docClient.send(command) 
        if (existsUser.Count !== 0) {
            return res.status(STATUS_BAD_REQUEST).json({
                status: MESSEGE_ERROR,
                data: [],
                message: "User already exists"
            })        }
    } catch(error) {
        console.error(error)
    }
    next();
}