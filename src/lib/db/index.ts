import pg from 'pg';
import {
  PFI_DB_HOST,
  PFI_DB_NAME,
  PFI_DB_USER,
  PFI_DB_PASSWORD,
  PFI_DB_PORT,
} from '$env/static/private';


const pool = new pg.Pool({
  host:       PFI_DB_HOST,
  database:   PFI_DB_NAME,
  user:       PFI_DB_USER,
  password:   PFI_DB_PASSWORD,
  port:       PFI_DB_PORT,
});

export const connectToDB = async () => await pool.connect();
