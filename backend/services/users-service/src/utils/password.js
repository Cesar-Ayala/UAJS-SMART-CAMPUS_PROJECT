import bcrypt from 'bcryptjs'

const BCRYPT_ROUNDS = 10

// Hash de relleno: se compara cuando el correo no existe, para que el login
// tarde lo mismo exista o no el usuario (evita descubrir correos registrados).
const DUMMY_HASH = bcrypt.hashSync('contraseña-de-relleno', BCRYPT_ROUNDS)

export const hashPassword = (password) => bcrypt.hash(password, BCRYPT_ROUNDS)

export const verifyPassword = (password, hash) => bcrypt.compare(password, hash ?? DUMMY_HASH)
