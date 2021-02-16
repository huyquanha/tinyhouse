import sgMail from "@sendgrid/mail";
import { IEmail } from "./types";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
sgMail.setApiKey(process.env.SENDGRID_KEY!);

export const sendEmail = async (mailData: IEmail): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  await sgMail.send({ ...mailData, from: process.env.SENDGRID_SENDER! });
};
