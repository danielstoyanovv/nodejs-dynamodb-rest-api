"use strict";

import { Request, Response } from "express"
const bcrypt = require("bcrypt")
import {
    MESSEGE_SUCCESS,
    MESSEGE_ERROR,
    MESSEGE_INTERNAL_SERVER_ERROR,
    STATUS_OK,
    STATUS_PATCH,
    STATUS_NO_CONTENT,
    STATUS_CREATED,
    STATUS_INTERNAL_SERVER_ERROR
} from "../constants/data"
import { 
    PutItemCommand, 
    GetItemCommand, 
    DeleteItemCommand, 
    UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { 
    ScanCommand  } from "@aws-sdk/lib-dynamodb";
import { ConnectToDatabase } from "../config/ConnectToDatabase";
const uuid = require('uuid');
import {RedisServerService} from "../services/RedisServerService";
import {config} from "dotenv"
config()

const API_PREFIX = process.env.API_PREFIX || "api"
const API_VERSION = process.env.API_VERSION || "v1"

const dynamoDBConnect = new ConnectToDatabase()
const docClient = dynamoDBConnect.getDocumentClient
const TABLE_NAME = process.env.DYNAMODB_USERS_TABLE_NAME
const redisClient = new RedisServerService().getRedisClient

export const getUsers = async ( req: Request,  res: Response) => {
    try { 
        const command = new ScanCommand({
            TableName: TABLE_NAME,
          });
        const users = await docClient.send(command)
        await redisClient.setEx("users", 600, JSON.stringify(users)); // Cache data for 10 minutes
        res.status(STATUS_OK).json({
            status: MESSEGE_SUCCESS,
            data: {
               users
            },
            message: ""
        })

    } catch (error) {
        console.log(error)
        res.status(STATUS_INTERNAL_SERVER_ERROR).json({
            status: MESSEGE_ERROR,
            data: [],
            message: MESSEGE_INTERNAL_SERVER_ERROR
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
                role: { S: role }
            }
        });
        const response = await docClient.send(command);
        if (response) {
            redisClient.del("users")
            const command = new GetItemCommand({
                TableName: TABLE_NAME,
                Key: {
                    id: { S: id },
                },
              });
            const response = await docClient.send(command);
            res.status(STATUS_CREATED).json({
                status: MESSEGE_SUCCESS,
                data: response,
                message: "New user registered successfully" 
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
        const cacheKey = "user_" + id
        await redisClient.setEx(cacheKey, 600, JSON.stringify(response)); // Cache data for 10 minutes
        res.status(STATUS_OK).json({
            status: MESSEGE_SUCCESS,
            data: response,
            message: ""
        })
    } catch (error) {
        console.error(error)
        return res.status(STATUS_INTERNAL_SERVER_ERROR).json({
            status: MESSEGE_ERROR,
            data: [],
            message: MESSEGE_INTERNAL_SERVER_ERROR
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
        const response = await docClient.send(command);
        await redisClient.del("users")
        const cacheKey = "user_" + id
        await redisClient.del(cacheKey)
        res.status(STATUS_NO_CONTENT).send(); // No content response
    } catch (error) {
        res.status(STATUS_INTERNAL_SERVER_ERROR).json({
            status: MESSEGE_ERROR,
            data: [],
            message: MESSEGE_INTERNAL_SERVER_ERROR
        })

    }
}

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const password = await bcrypt.hash(req.body.password, 10);
        const { email, role } = req.body;
        // const { ...data } = req.body
        // data.password =

        // console.log(data)
        
        // const command = new UpdateItemCommand({
            // TableName: TABLE_NAME,
            // Key: marshall({id: id}) 
                // id: { S: id },
                // email: { S: email},
                // password:  { S: password },
                // role: { S: role },
            
            // UpdateExpression: "set HasChunks = :chunks",
            // ExpressionAttributeValues: {
            //   ":chunks": { BOOL: "false" },
            // },
            // ReturnValues: "ALL_NEW",
        //   });
        // const response = await docClient.send(command);
        res.status(STATUS_PATCH).json({
            status: MESSEGE_SUCCESS,
            data: 2,
            message: ""
        })
    } catch (error) {
        console.error(error)
        res.status(STATUS_INTERNAL_SERVER_ERROR).json({
            status: MESSEGE_ERROR,
            data: [],
            message: MESSEGE_INTERNAL_SERVER_ERROR
        })

    }
}