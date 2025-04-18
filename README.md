# 🏗️ Kaan Backend

**Kaan** is a B2B platform that enables bulk buying with a collaborative twist. This is the backend system built with **Node.js**, **Express**, and **PostgreSQL**, using **Prisma ORM**.

## Project Structure

The backend is organized into multiple modules, each handling specific business functionalities. Currently, we have implemented the first module:

### Module 1: Authentication (`src/modules/auth/`)
This module handles user authentication using phone number verification via OTP.

#### Features
- Phone number-based authentication
- OTP generation and verification
- Secure user management
- SMS integration via Twilio

#### Database Schema
The authentication module uses the following models:

1. **User**
   - `id`: Unique identifier (CUID)
   - `phone`: Unique phone number
   - `createdAt`: Timestamp of user creation
   - `updatedAt`: Timestamp of last update

2. **Otp**
   - `id`: Unique identifier (CUID)
   - `phone`: Associated phone number
   - `codeHash`: Hashed OTP code
   - `expiresAt`: OTP expiration timestamp
   - `createdAt`: Timestamp of OTP creation

#### Authentication Flow
1. **OTP Request**
   - User provides phone number
   - System generates 6-digit OTP
   - OTP is hashed and stored in database
   - OTP is sent via SMS using Twilio
   - OTP expires after 5 minutes

2. **OTP Verification**
   - User provides phone number and OTP
   - System verifies OTP against stored hash
   - If valid, creates or retrieves user account
   - Used OTP is deleted from database

#### Core Components
- **AuthService**
  - `requestOtp(phone: string)`: Initiates OTP verification process
  - `verifyOtp(phone: string, otp: string)`: Verifies OTP and manages user creation

#### Utility Modules
- **OTP Utilities** (`src/utils/otp.ts`)
  - `generateOtp()`: Generates 6-digit random OTP
  - `hashOtp(otp: string)`: Securely hashes OTP using bcrypt
  - `verifyOtp(plain: string, hashed: string)`: Verifies OTP against hash

- **Twilio Integration** (`src/utils/twilio.ts`)
  - `sendOtpSms(phone: string, otp: string)`: Sends OTP via SMS using Twilio

#### Testing
Comprehensive test suite covering:
- OTP request flow
- OTP verification
- User creation
- Error handling for expired/invalid OTPs

### Upcoming Modules
The following modules are planned for future implementation:

1. **User Management**
   - Profile management
   - Role-based access control
   - User preferences

2. **Product Management**
   - Product catalog
   - Inventory management
   - Pricing and discounts

3. **Order Management**
   - Order processing
   - Payment integration
   - Order tracking

4. **Group Buying**
   - Group creation and management
   - Bulk order processing
   - Collaborative features

## Environment Variables
Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `TWILIO_ACCOUNT_SID`: Twilio account identifier
- `TWILIO_AUTH_TOKEN`: Twilio authentication token
- `TWILIO_PHONE_NUMBER`: Twilio phone number for sending SMS

## API Endpoints
- Base URL: `http://localhost:8000`
- Auth routes: `/auth/*`
  - POST `/auth/request-otp` - Request OTP
  - POST `/auth/verify-otp` - Verify OTP and get token
- Profile routes: `/profile/*`
  - POST `/profile` - Create profile (requires username and location)
  - PUT `/profile` - Update profile
  - GET `/profile` - Get profile
  - DELETE `/profile` - Delete profile

## Security Features
1. OTP hashing using bcrypt
2. Automatic OTP expiration (5 minutes)
3. One-time use of OTPs
4. Secure storage of sensitive credentials

## Development Setup
1. Install dependencies: `npm install`
2. Set up environment variables
3. Run database migrations: `npx prisma migrate dev`
4. Start the server: `npm run dev`

## Testing
Run tests using: `npm test`
- Unit tests for auth service
- Mock implementations for external services
- Comprehensive test coverage for authentication flow


### Notes
1. The `moq` (Minimum Order Quantity) field must be a positive number
2. The `interests` field must be an array of strings
3. All string fields are trimmed of whitespace
4. Profile updates are partial - only provided fields are updated
5. The `username` and `location` fields are required for profile creation
