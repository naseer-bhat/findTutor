import nodemailer from 'nodemailer';

export const connect = () => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    return transporter;
  } catch (error) {
    console.error('Error creating transporter:', error);
  }
};
