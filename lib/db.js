/**
 * Azure SQL Database connection library
 * Uses 'mssql' package for SQL Server connectivity
 */
import sql from 'mssql';

const config = {
  server: process.env.AZURE_SQL_SERVER,
  database: process.env.AZURE_SQL_DATABASE,
  user: process.env.AZURE_SQL_USER,
  password: 'puU!tvp$j8lvJhTdB#', //process.env.AZURE_SQL_PASSWORD,
  options: {
    encrypt: process.env.AZURE_SQL_ENCRYPT === 'true',
    trustServerCertificate: false,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

// Singleton connection pool
let pool = null;

/**
 * Get or create a connection pool
 * @returns {Promise<sql.ConnectionPool>}
 */
export async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}

/**
 * Execute a parameterized query
 * @param {string} query - SQL query with @param placeholders
 * @param {Object} params - { name: { type: sql.NVarChar, value: 'x' } }
 * @returns {Promise<sql.IResult>}
 */
export async function query(queryText, params = {}) {
  const p = await getPool();
  const request = p.request();

  for (const [name, param] of Object.entries(params)) {
    request.input(name, param.type, param.value);
  }

  return request.query(queryText);
}

/**
 * Execute a stored procedure
 * @param {string} procedureName
 * @param {Object} params - { name: { type: sql.NVarChar, value: 'x' } }
 * @returns {Promise<sql.IProcedureResult>}
 */
export async function execute(procedureName, params = {}) {
  const p = await getPool();
  const request = p.request();

  for (const [name, param] of Object.entries(params)) {
    request.input(name, param.type, param.value);
  }

  return request.execute(procedureName);
}

// Re-export sql types for convenient use
export { sql };
