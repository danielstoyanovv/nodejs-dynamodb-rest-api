"use strict";

import { 
    DynamoDBClient, 
  } from "@aws-sdk/client-dynamodb";
import { 
    DynamoDBDocumentClient, 
} from "@aws-sdk/lib-dynamodb";

export class DynamoDBConnect {
    get getDocumentClient() {
        const client = new DynamoDBClient({
            region: "eu-west-3"
        });
        
        return DynamoDBDocumentClient.from(client)
    }   
}