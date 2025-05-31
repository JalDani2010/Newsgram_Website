const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.FROM_EMAIL || "noreply@Newsgram.com",
      to: email,
      subject: "Verify Your Email - Newsgram",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">Welcome to Newsgram!</h2>
          <p>Thank you for registering with Newsgram. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            This link will expire in 24 hours. If you didn't create an account with Newsgram, please ignore this email.
          </p>
        </div>
      `,
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.FROM_EMAIL || "noreply@newsgram.com",
      to: email,
      subject: "Password Reset - Newsgram",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          <p>You requested a password reset for your Newsgram account. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            This link will expire in 10 minutes. If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      `,
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendWeeklyDigest(email, articles) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || "noreply@newsgram.com",
      to: email,
      subject: "Your Weekly News Digest - Newsgram",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">Your Weekly News Digest</h2>
          <p>Here are the top stories from this week based on your interests:</p>
          
          ${articles
            .map(
              (article) => `
            <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin: 15px 0;">
              ${
                article.imageUrl
                  ? `<img src="${article.imageUrl}" alt="${article.title}" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 4px;">`
                  : ""
              }
              <h3 style="margin: 10px 0; color: #333;">
                <a href="${process.env.FRONTEND_URL}/article/${
                article.slug
              }" style="text-decoration: none; color: #333;">
                  ${article.title}
                </a>
              </h3>
              <p style="color: #666; margin: 10px 0;">${article.description}</p>
              <div style="font-size: 12px; color: #999;">
                ${article.source} • ${new Date(
                article.publishedAt
              ).toLocaleDateString()}
              </div>
            </div>
          `
            )
            .join("")}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Read More on Newsgram
            </a>
          </div>
          
          <p style="margin-top: 30px; color: #666; font-size: 14px; text-align: center;">
            You're receiving this because you subscribed to weekly digests. 
            <a href="${
              process.env.FRONTEND_URL
            }/unsubscribe" style="color: #007bff;">Unsubscribe</a>
          </p>
        </div>
      `,
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendBreakingNewsAlert(email, article) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || "noreply@Newsgram.com",
      to: email,
      subject: `🚨 Breaking News: ${article.title}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="background-color: #dc3545; color: white; padding: 10px; text-align: center; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="margin: 0;">🚨 BREAKING NEWS</h2>
          </div>
          
          ${
            article.imageUrl
              ? `<img src="${article.imageUrl}" alt="${article.title}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px;">`
              : ""
          }
          
          <h2 style="color: #333; margin: 20px 0;">
            <a href="${process.env.FRONTEND_URL}/article/${
        article.slug
      }" style="text-decoration: none; color: #333;">
              ${article.title}
            </a>
          </h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">${
            article.description
          }</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/article/${article.slug}" 
               style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Read Full Story
            </a>
          </div>
          
          <div style="border-top: 1px solid #ddd; padding-top: 15px; font-size: 12px; color: #999;">
            ${article.source} • ${new Date(
        article.publishedAt
      ).toLocaleString()}
          </div>
          
          <p style="margin-top: 30px; color: #666; font-size: 14px; text-align: center;">
            You're receiving this breaking news alert based on your notification preferences. 
            <a href="${
              process.env.FRONTEND_URL
            }/profile" style="color: #007bff;">Manage preferences</a>
          </p>
        </div>
      `,
    };

    return this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();
