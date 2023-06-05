const nodemailer = require("nodemailer");
const main = async (options) => {
  

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'prince.shields@ethereal.email',
        pass: 'nKxJAaEkTYVfjVEqHX'
    },
  });

  const mailOptions = {
    from: "kshitij sharma <admin@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports=main