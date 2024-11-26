"use strict";

import {
    Request, 
    Response, 
    NextFunction } from "express";
import { 
     GetItemCommand } from "@aws-sdk/client-dynamodb";
import {  
    ScanCommand  } from "@aws-sdk/lib-dynamodb";
import { STATUS_ERROR } from "../constants/data"
import {config} from "dotenv"
import { ConnectToDatabase } from "../config/ConnectToDatabase";

config()

const dynamoDBConnect = new ConnectToDatabase()
const docClient = dynamoDBConnect.getDocumentClient
const TABLE_NAME = process.env.DYNAMODB_USERS_TABLE_NAME

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const { email } = req.body;
    const command = new GetItemCommand({
        TableName: TABLE_NAME,
        // For more information about data types,
        // see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.NamingRulesDataTypes.html#HowItWorks.DataTypes and
        // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.LowLevelAPI.html#Programming.LowLevelAPI.DataTypeDescriptors
        Key: {
            id: { S: id },
        },
      });
    
    const user = await docClient.send(command);
    if (user && user.Item) {
        if (user.Item.email.S !== email) {      
            const command = new ScanCommand({
                TableName: TABLE_NAME,
                FilterExpression: "email = :e",
                ExpressionAttributeValues: {
                    ":e": email
                }
            });
            const existsUsers = await docClient.send(command)
            if (existsUsers.Count !== 0) {
                return res.status(400).json({
                    status: STATUS_ERROR, 
                    data: [],
                    message: "User already exists" 
                })
            }  
        }
    }
    next();
}