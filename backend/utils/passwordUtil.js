import argon2 from 'argon2';

export const hashPassword = async (password) => {
  try {
    return await argon2.hash(password);
  } catch (err) {
    throw new Error('Password hashing failed');
  }
};

export const verifyPassword = async (hashedPassword, plainPassword) => {
  try {
    return await argon2.verify(hashedPassword, plainPassword);
  } catch (err) {
    throw new Error('Password verification failed');
  }
};