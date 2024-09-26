"use strict";

import express from "express"
import {config} from "dotenv"
config()
import { Request, Response } from "express"
import {validateUserRequest} from "./middleware/validateUserRequest";
import {createUser, updateUser, deleteUser} from "./controllers/userController";
import {VerifyToken} from "./middleware/verifyToken";
import cors from "cors";
import { existsUser } from "./middleware/existsUser.js";
import { verifyEmail } from "./middleware/verifyEmail.js";
import {loginUser} from "./controllers/authController";
import userRoutes from "./routes/user";

const app = express()

const port = process.env.SERVER_PORT || 4000

app.use(cors())

app.use(express.json())

app.use('/api/users', userRoutes)

app.get('/', (req: Request, res: Response) => {
    res.json({mssg: 'Welcome to the app'})
})

app.post("/admin", (req: Request, res: Response) => {
    const { username } = req.body;
    res.send(`This is an Admin Route. Welcome ${username}`);
});

app.post("/api/users", validateUserRequest, existsUser, createUser);

app.patch('/api/users/:id', validateUserRequest, verifyEmail, VerifyToken, updateUser)

app.delete('/api/users/:id', VerifyToken, deleteUser)

app.post('/api/login', validateUserRequest, loginUser)

app.listen(port, () => {
    console.log('listening on port', port)
})