import { Controller, Post, Body, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import * as admin from 'firebase-admin';
import axios from 'axios';


//simple auth controller 2 get idToken and Refreshtoken from firebase, only in this 1st stage remove later 
@ApiTags('auth')
@Controller('auth')
export class AuthController {
private readonly logger = new Logger(AuthController.name);

  @Post('login')
  @ApiBody({ schema: { properties: { email: { type: 'string' }, password: { type: 'string' } } } })
  @ApiResponse({ status: 201, description: 'Firebase ID token returned.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    if (!email || !password) {
      throw new HttpException('Email and password are required', HttpStatus.BAD_REQUEST);
    }
    try {
     
      const apiKey = process.env.FIREBASE_API_KEY;
      if (!apiKey) {
        throw new HttpException('FIREBASE_API_KEY not set', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      const response = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          email,
          password,
          returnSecureToken: true,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      return { idToken: response.data.idToken, refreshToken: response.data.refreshToken };
    } catch (error: any) {
      throw new HttpException(
        error?.response?.data?.error?.message || 'Invalid credentials',
        HttpStatus.UNAUTHORIZED
      );
    }
  }
} 