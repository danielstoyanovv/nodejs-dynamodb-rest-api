"use strict";

import {
    Request, 
    Response, 
    NextFunction } from "express";
import emailValidator from "email-validator";
import {
    MESSEGE_ERROR,
    STATUS_BAD_REQUEST
} from "../constants/data"

export const validateUserRequestMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const ROLES = ['admin', 'user']
    const { email, password, role } = req.body;
    const validationErrors = [];
    if (!emailValidator.validate(email)) {
        validationErrors.push('email is not valid')
    }
    if (!password || password.length > 20 || password.length < 6) {
        validationErrors.push("password is not valid");
    }
    if (!role || !ROLES.includes(role) ) {
        validationErrors.push("role is not valid, valid roles: 'admin', 'user'")
    }
    if (validationErrors.length > 0) {
        return res.status(STATUS_BAD_REQUEST).json({
            status: MESSEGE_ERROR,
            data: [],
            message: validationErrors
        })
    }
    next();
}
