import type {Algorithm} from 'jsonwebtoken';

export const jwtSecretKey = 'bce-sdk-js';

export const jwtAlgorithm: Algorithm = 'HS256';

export const PORT = process.env.PORT || 3000;
