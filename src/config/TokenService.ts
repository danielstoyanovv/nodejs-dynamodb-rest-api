"use strict";

import jwt from "jsonwebtoken";
import {config} from "dotenv"
config()
export class TokenService {
    #userId: number
    #userEmail: string
    #userRole: string
    get getToken() {
        return jwt.sign({
            id: this.getUserId,
            email: this.getUserEmail(),
            role: this.getUserRole()
        }, process.env.JWT_SECRET!, {
            expiresIn: 180
        })
    }
    setUserId(userId: number) {
        this.#userId = userId;
        return this
    }
    getUserId() {
        return this.#userId
    }

    setUserEmail(userEmail: string) {
        this.#userEmail = userEmail
        return this
    }
    getUserEmail() {
        return this.#userEmail
    }
    setUserRole(userRole: string) {
        this.#userRole = userRole
        return this
    }
    getUserRole() {
        return this.#userRole
    }

}