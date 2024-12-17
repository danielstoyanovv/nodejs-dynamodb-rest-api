"use strict";

import express from "express"
import {config} from "dotenv"
config()
import { Request, Response } from "express"
import {validateUserRequestMiddleware} from "./middleware/validateUserRequestMiddleware";
import {
    createUser,
    updateUser,
    deleteUser,
    getUser,
    getUsers} from "./controllers/userController";
import {VerifyTokenMiddleware} from "./middleware/verifyTokenMiddleware";
import cors from "cors";
import { existsUserMiddleware } from "./middleware/existsUserMiddleware";
import { verifyEmailMiddleware } from "./middleware/verifyEmailMiddleware";
import {loginUser} from "./controllers/authenticationController";
import {getUsersFromCacheMiddleware} from "./middleware/getUsersFromCacheMiddleware";
import {getUserFromCacheMiddleware} from "./middleware/getUserFromCacheMiddleware";

const app = express()

const port = process.env.BACKED_PORT || 4000

app.use(cors())

app.use(express.json())
app.get('/', (req: Request, res: Response) => {
    res.json({mssg: 'Welcome to the app'})
})

app.post("/admin", (req: Request, res: Response) => {
    const { username } = req.body;
    res.send(`This is an Admin Route. Welcome ${username}`);
});

app.post("/api/users", validateUserRequestMiddleware, existsUserMiddleware, createUser);

app.patch('/api/users/:id', validateUserRequestMiddleware, verifyEmailMiddleware, VerifyTokenMiddleware, updateUser)

app.delete('/api/users/:id', VerifyTokenMiddleware, deleteUser)

app.post('/api/login', validateUserRequestMiddleware, loginUser)

app.get("/api/users", getUsersFromCacheMiddleware, getUsers);

app.get('/api/users/:id', getUserFromCacheMiddleware, getUser)
app.listen(port, () => {
    console.log('listening on port', port)
})