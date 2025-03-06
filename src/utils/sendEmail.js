const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        // Create a transporter
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com', // Gmail SMTP server
            port: 587, // Port for STARTTLS
            secure: false, // true for port 465, false for others
            auth: {
                user: process.env.EMAIL_USERNAME, // Gmail username
                pass: process.env.EMAIL_PASSWORD, // App password
            },
        });

        // Define email options
        const mailOptions = {
            from: '"ASp" <no-reply@yourapp.com>', // Sender's name and email
            to: options.email, // Recipient's email
            subject: options.subject, // Email subject
            text: options.message, // Email body
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    } catch (error) {
        console.error('Error sending email:', error.message);
        throw new Error('Failed to send email. Please try again later.');
    }
};

module.exports = sendEmail;
