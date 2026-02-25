const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Generate a random 6-digit OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP email for email verification
 * @param {string} to - Recipient email address
 * @param {string} otp - OTP code to send
 * @returns {Promise} - Nodemailer send result
 */
const sendOTPEmail = async (to, otp) => {
    const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || "CP-Sheet"}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to,
        subject: "Email Verification OTP",
        text: `Your OTP for email verification is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nIf you didn't request this, please ignore this email.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Email Verification</h2>
                <p>Your OTP for email verification is:</p>
                <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #007bff; letter-spacing: 5px; margin: 0;">${otp}</h1>
                </div>
                <p>This OTP is valid for <strong>10 minutes</strong>.</p>
                <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
            </div>
        `,
    };

    return await transporter.sendMail(mailOptions);
};

/**
 * Verify SMTP connection
 * @returns {Promise<boolean>} - True if connection is successful
 */
const verifyConnection = async () => {
    try {
        await transporter.verify();
        console.log("SMTP connection verified successfully");
        return true;
    } catch (error) {
        console.error("SMTP connection failed:", error.message);
        return false;
    }
};

module.exports = {
    generateOTP,
    sendOTPEmail,
    verifyConnection,
};
