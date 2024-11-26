"use strict";

import {
    Request, 
    Response, 
    NextFunction } from "express";
import emailValidator from "email-validator";
import { STATUS_ERROR } from "../constants/data"

export const validateUserRequest = async (req: Request, res: Response, next: NextFunction) => {
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
        return res.status(400).json({
            status: STATUS_ERROR, 
            data: [],
            message: validationErrors
        })
    }
    next();
}
