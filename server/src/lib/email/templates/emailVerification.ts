import { EmailVerification, User } from "../../types";
import { IEmail } from "../types";

export const createVerificationEmail = (
  user: User,
  emailVerification: EmailVerification
): IEmail => {
  return {
    to: user.contact,
    subject: "Welcome to Tinyhouse!",
    html: `
      <html>
        <body>
          <h3>Hi ${user.name}</h3>
          <p>
            Please click this link to verify your email address: <a href="${process.env.PUBLIC_URL}/verifyEmail?token=${emailVerification.token}">Verify</a>
          </p>
          <p>
            This link will expire after 24 hours and will need to be re-generated.
          </p>
        </body>
      </html>
    `,
  };
};
