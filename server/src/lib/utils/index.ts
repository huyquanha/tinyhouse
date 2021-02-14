import { Request } from 'express';
import { VIEWER_COOKIE } from '../constants';
import { UserDocument } from '../types';
import { Database } from '../../database';

// we return null instead of undefined since MongoDB findOne() functions return
// null if it cannot find the user
export const authorize = async (
  db: Database,
  req: Request
): Promise<UserDocument | null> => {
  const token = req.get('X-CSRF-TOKEN');
  const viewer = await db.users.findOne({
    _id: req.signedCookies[VIEWER_COOKIE],
    token,
  });
  return viewer;
};
