"use strict";

import { Request, Response } from "express"
const bcrypt = require("bcrypt")
import { 
    STATUS_SUCCESS, 
    STATUS_ERROR, 
    INTERNAL_SERVER_ERROR } from "../config/data"
import { 
    DynamoDBClient, 
    PutItemCommand, 
    GetItemCommand, 
    DeleteItemCommand, 
    UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { 
    DynamoDBDocumentClient, 
    ScanCommand  } from "@aws-sdk/lib-dynamodb";
import { 
    marshall, 
    unmarshall } from "@aws-sdk/util-dynamodb";
const uuid = require('uuid');
import {config} from "dotenv"
config()
const client = new DynamoDBClient({
    region: "eu-west-3"
});
const docClient = DynamoDBDocumentClient.from(client)
const TABLE_NAME = process.env.USERS_TABLE_NAME

export const getUsers = async ( req: Request,  res: Response) => {
    try { 
        const command = new ScanCommand({
            TableName: TABLE_NAME,
          });

        const users = await docClient.send(command)
        res.status(200).json({
            status: STATUS_SUCCESS, 
            data: {
               users
            },
            message: ""
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ 
            status: STATUS_ERROR, 
            data: [],
            message: INTERNAL_SERVER_ERROR 
        });
    }
}

export const createUser = async ( req: Request,  res: Response) => {
    try {
        const { email, role } = req.body;
        const id = uuid.v4()
        const password = await bcrypt.hash(req.body.password, 10);
        const command = new PutItemCommand({
            TableName: TABLE_NAME,
            Item: {
                id: { S: id },
                email: { S: email},
                password:  { S: password },
                role: { S: role },

            }
        });
        const response = await client.send(command);
        if (response) {
            const command = new GetItemCommand({
                TableName: TABLE_NAME,
                Key: {
                    id: { S: id },
                },
              });
            const response = await docClient.send(command);
            if (response.Item) {
                console.log(response.Item.id)
                console.log(response.Item.id.S)
             
                console.log(typeof response.Item.id)
            }
            res.status(201).json({ 
                status: STATUS_SUCCESS, 
                data: response,
                message: "New user registered successfully" 
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

export const getUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const command = new GetItemCommand({
            TableName: TABLE_NAME,
            Key: {
                id: { S: id },
            },
          });
        const response = await docClient.send(command);
        res.status(200).json({
            status: STATUS_SUCCESS, 
            data: response,
            message: ""
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            status: STATUS_ERROR, 
            data: [],
            message: INTERNAL_SERVER_ERROR
        })

    }
}

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const command = new DeleteItemCommand({
            TableName: TABLE_NAME,
            // For more information about data types,
            // see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.NamingRulesDataTypes.html#HowItWorks.DataTypes and
            // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.LowLevelAPI.html#Programming.LowLevelAPI.DataTypeDescriptors
            Key: {
              id: { S: id },
            },
          });
          const response = await client.send(command);
        res.status(200).json({
            status: STATUS_SUCCESS,
            data: response,
            message: "User is deleted successfully"
        })
    } catch (error) {
        res.status(500).json({
            status: STATUS_ERROR, 
            data: [],
            message: INTERNAL_SERVER_ERROR
        })

    }
}

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const password = await bcrypt.hash(req.body.password, 10);
        const { email, role } = req.body;
        const objKeys = Object.keys(req.body)
        const command = new UpdateItemCommand({
            TableName: TABLE_NAME,
            // For more information about data types,
            // see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.NamingRulesDataTypes.html#HowItWorks.DataTypes and
            // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.LowLevelAPI.html#Programming.LowLevelAPI.DataTypeDescriptors
            Key: marshall({id: id}) 
                // id: { S: id },
                // email: { S: email},
                // password:  { S: password },
                // role: { S: role },
            
            // UpdateExpression: "set HasChunks = :chunks",
            // ExpressionAttributeValues: {
            //   ":chunks": { BOOL: "false" },
            // },
            // ReturnValues: "ALL_NEW",
          });
        const response = await client.send(command);
        res.status(200).json({
            status: STATUS_SUCCESS, 
            data: response,
            message: ""
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            status: STATUS_ERROR, 
            data: [],
            message: INTERNAL_SERVER_ERROR
        })

    }
}