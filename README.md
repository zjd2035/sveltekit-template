## Starting a Sveltekit App

1. Start by creating a directory for your new project, and copying all of the contents of this directory into it.

```bash
cd ~/Projects/
mkdir new-app
cd sveltekit-template/
cp -R . ../new-app/
cd ../new-app/
```


1. Initialize your git repository.

```bash
git init

# Copy your repository URL from github and replace it here:
git remote add origin https://github.com/new-app

git branch -M main
git add .
git commit -m "Initializing a new sveltekit app from the sveltekit-template"
git push origin main
```


1. Setup postgres on your local machine.

```bash
brew install postgresql@15
brew services start postgresql@15
```

### Common psql commands

```
\q: Exit psql connection
\c: Connect to a new database
\dt: List all tables
\du: List all roles
\list: List databases
\d table_name: Describe a single table
```


1. Create a new user for your postgres db

```bash
psql postgres
CREATE ROLE new-app-admin WITH LOGIN PASSWORD 'password';
ALTER ROLE new-app-admin CREATEDB;
\q

# Login as your new user
psql -d postgres -U new-app-admin
```


1. Create a db, and the necessary tables for the sveltekit-template's auth and session management.

```bash
CREATE DATABASE new-app-db;

CREATE TABLE app_user (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  password TEXT NOT NULL
);

CREATE TABLE user_session (
  id TEXT NOT NULL,
  user_id INTEGER NOT NULL REFERENCES app_user(id),
  expires_at TIMESTAMPTZ NOT NULL
);

# Sign out of psql for next steps
\q
```


1. Next, create a .env file to story the credentials for the app to access your database.

```bash
touch .env
```

Inside the file, add the following variables

```bash
PFI_DB_HOST="localhost"
PFI_DB_NAME="new-app-db"
PFI_DB_USER="new-app-admin"
PFI_DB_PASSWORD="password"
PFI_DB_PORT=5432
```


1. Install your dependencies

```bash
pnpm dlx  sv add tailwindcss
pnpm i
```


1. Start the app and check your browser!

```bash
pnpm dev
```

Check [your new app](http://localhost:5173/) out in your browser!
