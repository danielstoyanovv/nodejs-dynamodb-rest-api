"use strict";

import express from "express"
import {config} from "dotenv"
config()
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
const API_PREFIX = process.env.API_PREFIX || "api"
const API_VERSION = process.env.API_VERSION || "v1"

app.use(cors())

app.use(express.json())

app.post("/" + API_PREFIX + "/" + API_VERSION + "/users", validateUserRequestMiddleware, existsUserMiddleware, createUser);

app.patch("/" + API_PREFIX + "/" + API_VERSION + "/users/:id", validateUserRequestMiddleware, verifyEmailMiddleware, VerifyTokenMiddleware, updateUser)

app.delete("/" + API_PREFIX + "/" + API_VERSION + "/users/:id", VerifyTokenMiddleware, deleteUser)

app.post("/" + API_PREFIX + "/" + API_VERSION + "/login", validateUserRequestMiddleware, loginUser)

app.get("/" + API_PREFIX + "/" + API_VERSION + "/users", getUsersFromCacheMiddleware, getUsers);

app.get("/" + API_PREFIX + "/" + API_VERSION + "/users/:id", getUserFromCacheMiddleware, getUser)
app.listen(port, () => {
    console.log('listening on port', port)
})