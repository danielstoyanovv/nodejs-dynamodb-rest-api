import { STATUS_ERROR } from "../config/data"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand  } from "@aws-sdk/lib-dynamodb";
import {Request, Response, NextFunction } from "express";
import {config} from "dotenv"
config()

const client = new DynamoDBClient({
    region: "eu-west-3"
});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.USERS_TABLE_NAME

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
        const existsUser = await client.send(command) 
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