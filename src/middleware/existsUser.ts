"use strict";

import { STATUS_ERROR } from "../config/data"
import { 
     ScanCommand  } from "@aws-sdk/lib-dynamodb";
import {
    Request, 
    Response, 
    NextFunction } from "express";
import {config} from "dotenv"
import { DynamoDBConnect } from "../config/DynamoDBConnect";
config()

const dynamoDBConnect = new DynamoDBConnect()
const docClient = dynamoDBConnect.getDocumentClient
const TABLE_NAME = process.env.DYNAMODB_USERS_TABLE_NAME

export async function existsUser(req: Request, res: Response, next: NextFunction) {
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
            return res.status(400).json({
                status: STATUS_ERROR, 
                data: [],
                message: "User already exists"
            })        }
    } catch(error) {
        console.error(error)
    }
    next();
}