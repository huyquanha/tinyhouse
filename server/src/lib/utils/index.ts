import { Request } from 'express';
import { COOKIE_NAME } from '../constants';
import { Database, User } from '../types';

// we return null instead of undefined since MongoDB findOne() functions return
// null if it cannot find the user
export const authorize = async (
  db: Database,
  req: Request
): Promise<User | null> => {
  const token = req.get('X-CSRF-TOKEN');
  const viewer = await db.users.findOne({
    _id: req.signedCookies[COOKIE_NAME],
    token,
  });
  return viewer;
};
