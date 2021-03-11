import { Request } from "express";
import { ObjectId } from "mongodb";
import { VIEWER_COOKIE } from "../constants";
import { Database, User } from "../types";

// we return null instead of undefined since MongoDB findOne() functions return
// null if it cannot find the user
export const authorize = async (
  db: Database,
  req: Request
): Promise<User | null> => {
  const token = req.get("X-CSRF-TOKEN");
  return db.users.findOne({
    _id: new ObjectId(req.signedCookies[VIEWER_COOKIE]),
    token,
  });
};
