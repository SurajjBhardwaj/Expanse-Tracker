# Project

This project is a full-stack application for expense tracking, built with React, TypeScript, Vite, Express, and Prisma.

## Prerequisites

Ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (version 16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (for the backend database)

---

## Backend Setup

1. **Navigate to the backend directory**:

   ```bash
   cd backend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   - Create a `.env` file in the `backend` directory.
   - Copy the contents of `.env.example` (if available) or use the following template:
     ```properties
     DATABASE_URL="your_mongodb_connection_string"
     JWT_SECRET="your_jwt_secret_key"
     PORT=5000
     CLIENT_URL="http://localhost:5173"
     NODE_ENV="development"
     ```

4. **Generate Prisma client**:

   ```bash
   npx prisma generate
   ```

5. **Run the backend in development mode**:

   ```bash
   npm run dev
   ```

6. **Build the backend for production** (optional):

   ```bash
   npm run build
   ```

7. **Start the backend in production mode** (optional):
   ```bash
   npm start
   ```

---

## Frontend Setup

1. **Navigate to the frontend directory**:

   ```bash
   cd frontend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   - Create a `.env` file in the `frontend` directory.
   - Use the following template:
     ```properties
     VITE_PUBLIC_API_URL="http://localhost:5000"
     ```

4. **Run the frontend in development mode**:

   ```bash
   npm run dev
   ```

5. **Build the frontend for production** (optional):

   ```bash
   npm run build
   ```

6. **Preview the production build** (optional):
   ```bash
   npm run preview
   ```

---

## Running the Full Application

1. **Start the backend**:

   - Ensure the backend is running on `http://localhost:5000`.

2. **Start the frontend**:

   - Ensure the frontend is running on `http://localhost:5173`.

3. **Access the application**:
   - Open your browser and navigate to `http://localhost:5173`.

---

## Additional Notes

- **Database Setup**:

  - Ensure your MongoDB instance is running and accessible via the `DATABASE_URL` in the backend `.env` file.

- **Prisma Migrations**:

  - If you need to apply database migrations, use:
    ```bash
    npx prisma migrate dev
    ```

- **Linting**:

  - Run the linter for the frontend:
    ```bash
    npm run lint
    ```

- **Testing**:
  - Add tests as needed for both backend and frontend.

---

## Troubleshooting

- If you encounter issues with dependencies, try deleting `node_modules` and reinstalling:

  ```bash
  rm -rf node_modules
  npm install
  ```

- Ensure the backend and frontend `.env` files are correctly configured.

- Check the logs for detailed error messages.
