import {Request, Response, NextFunction } from "express";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand  } from "@aws-sdk/lib-dynamodb";
import { STATUS_ERROR } from "../config/data"
import {config} from "dotenv"
config()

const client = new DynamoDBClient({
    region: "eu-west-3"
});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.USERS_TABLE_NAME

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
    
    const user = await client.send(command);
    if (user && user.Item) {
        if (user.Item.email !== email) {      
            const command = new ScanCommand({
                TableName: TABLE_NAME,
                FilterExpression: "email = :e",
                ExpressionAttributeValues: {
                    ":e": email
                }
            });
            const existsUsers = await client.send(command)
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