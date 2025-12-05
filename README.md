# Paggo OCR Case

This project is a solution for the case proposed by Paggo.

Response Delay: As the backend is hosted on a free cloud service, some functionalities might take longer to respond.
OCR Technology: The system applies OCR technology only for image documents.

## Necessary Services

This project utilized the Groq service for LLM (Large Language Model) usage and the Cloudinary service for document storage. So, you must sign up at https://groq.com/ and https://cloudinary.com/ to create the API keys.

## Installation

### Backend

To install all necessary dependencies:

```bash
cd backend
npm install
```

To run all migrations:

```bash
npx prisma migrate dev
```

### Frontend

To install all necessary dependencies:

```bash
cd frontend
npm install
```

## Environment variables (Backend)

To run this project, you'll need to add the following environment variables to your .env file in backend project.

`DATABASE_URL` Connection string for the database.

`OPENAI_API_KEY` Your API Key for Groq (LLM service).

`JWT_SECRET` Your Secret Key for signing JSON Web Tokens (JWTs).

`CLOUDINARY_CLOUD_NAME` Your Cloudinary cloud name.

`CLOUDINARY_API_KEY` Your Cloudinary API Key.

`CLOUDINARY_API_SECRET` Your Cloudinary API Secret.

## Compile and run the project

### Backend

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Frontend

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
