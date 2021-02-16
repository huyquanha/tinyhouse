export const VIEWER_COOKIE = "viewer";

export const cookieOptions = {
  httpOnly: true, // prevent XSS
  sameSite: true, // prevent CSRF
  signed: true, // creates an HMAC of the value and base64-encode it to avoid cookie being tampered
  secure: process.env.NODE_ENV === "development" ? false : true, // HTTPS only, but not for development
};
