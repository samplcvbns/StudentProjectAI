import nodemailer from "nodemailer"

export const transporter = nodemailer.createTransport({
  service: "Gmail", // You can use other services like Outlook, Yahoo, etc.
  auth: {
    user: "chinedusimeon2020@gmail.com", // Your Gmail address
    pass: "vldfrvswvigkhhci", // Your email password or app password
  },
});
