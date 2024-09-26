"use strict";

import {config} from "dotenv"
config()

import { 
    DynamoDBClient, 
  } from "@aws-sdk/client-dynamodb";
import { 
    DynamoDBDocumentClient, 
} from "@aws-sdk/lib-dynamodb";

const region = process.env.DYNAMODB_DEFAULT_REGION || "eu-west-3"

export class DynamoDBConnect {
    get getDocumentClient() {
        const client = new DynamoDBClient({
            region: region
        });
        
        return DynamoDBDocumentClient.from(client)
    }   
}