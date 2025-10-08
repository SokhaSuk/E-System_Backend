// Initializes application database user on first container startup.
// Executed automatically by the official MongoDB image when mounted under /docker-entrypoint-initdb.d

db = db.getSiblingDB('e_system');

db.createUser({
	user: 'e_system_user',
	pwd: 'e_system_password',
	roles: [{ role: 'readWrite', db: 'e_system' }],
});
