import { transporter } from "../utils/emailTransporterUtil.js";

export const sendEmailToVerify = async (name, email, verificationLink) => {
  await transporter.sendMail({
    from: "chinedusimeon2020@gmail.com",
    to: email,
    subject: "Verify Your Account",
    html: `
  <div style="
    font-family: 'Montserrat',  sans-serif;
    background-color: #f9f9f9;
    padding: 20px;
    text-align: center;
    color: #333;">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Raleway:ital,wght@0,100..900;1,100..900&display=swap');
    </style>
    <div style="
      max-width: 600px;
      margin: auto;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      overflow: hidden;">
      <div style="padding: 20px 20px 0;">
        <img src="https://speunibenvoting.vercel.app/assets/spelogo-CmFXs7lC.jpeg" alt="Logo" style="width: 150px; height: auto;" />
      </div>
      <div style="
        background: #1c80df;
        color: white;
        padding: 15px 20px;">
        <h1 style="margin: 0; font-size: 24px; font-family: 'Montserrat',  sans-serif;">Welcome to SPE UNIBEN ELECTION!</h1>
      </div>
      <div style="padding: 20px;">
        <p style="font-size: 16px; margin-bottom: 20px; color: #333; font-family: 'Montserrat',  sans-serif;">
          Hello ${name},<br/><br/>
          We're excited to have you join our community. Please verify your email to get started and enjoy all the benefits of our platform.
        </p>
        <a href="${verificationLink}" style="
          display: inline-block;
          text-decoration: none;
          background-color: #1c80df;
          color: white;
          padding: 12px 25px;
          font-size: 16px;
          border-radius: 5px;
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
          font-family: 'Montserrat',  sans-serif;">
          Verify My Account
        </a>
      </div>
      <div style="
        background: #f1f1f1;
        color: #777;
        font-size: 12px;
        padding: 10px 20px;">
        <p style="margin: 0; font-family: 'Montserrat',  sans-serif;">
          Need help? Check out our <a href="https://help.yourplatform.com" style="color: #1c80df; text-decoration: none;">Help Center</a> or contact support.
        </p>
        <p style="margin-top: 5px; font-family: 'Montserrat',  sans-serif;">&copy; 2024 [Your Platform Name]. All rights reserved.</p>
      </div>
    </div>
  </div>
`,
  });
};

export const sendEmailForForgotPassword = async (email, resetLink) => {
  await transporter.sendMail({
    from: "chinedusimeon2020@gmail.com",
    to: email,
    subject: "Reset Your Password",
    html: `
        <div style="font-family: Arial, sans-serif; text-align: center;">
          <h1>Password Reset Request</h1>
          <p>Click the link below to reset your password. This link will expire in 1 hour.</p>
          <a href="${resetLink}" style="
            display: inline-block;
            background-color: #1c80df;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
          ">Reset Password</a>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
  });
};
