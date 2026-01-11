/**
 * Email notification utilities using nodemailer.
 */
import nodemailer from 'nodemailer';
import { env } from '../config/env';

// Email templates
export interface EmailTemplate {
	subject: string;
	html: string;
	text: string;
}

export interface EmailData {
	to: string | string[];
	subject: string;
	html: string;
	text?: string;
	attachments?: Array<{
		filename: string;
		path: string;
		contentType?: string;
	}>;
}

// Create transporter
const createTransporter = () => {
	return nodemailer.createTransport({
		host: env.smtp.host,
		port: env.smtp.port,
		secure: env.smtp.secure,
		auth: {
			user: env.smtp.user,
			pass: env.smtp.pass,
		},
	});
};

// Send email
export const sendEmail = async (emailData: EmailData): Promise<void> => {
	try {
		const transporter = createTransporter();

		const mailOptions = {
			from: `"E-System" <${env.smtp.user}>`,
			to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
			subject: emailData.subject,
			html: emailData.html,
			text: emailData.text || emailData.html.replace(/<[^>]*>/g, ''),
			attachments: emailData.attachments,
		};

		await transporter.sendMail(mailOptions);
		console.log('Email sent successfully');
	} catch (error) {
		console.error('Error sending email:', error);
		throw error;
	}
};

// Email templates
export const emailTemplates = {
	// Welcome email
	welcome: (
		userName: string,
		userEmail: string,
		role: string
	): EmailTemplate => ({
		subject: 'Welcome to E-System',
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h2 style="color: #333;">Welcome to E-System!</h2>
				<p>Hello ${userName},</p>
				<p>Welcome to our educational management system. Your account has been successfully created with the role of <strong>${role}</strong>.</p>
				<p>You can now log in to your account and start using the system.</p>
				<p>If you have any questions, please don't hesitate to contact our support team.</p>
				<br>
				<p>Best regards,<br>E-System Team</p>
			</div>
		`,
		text: `Welcome to E-System! Hello ${userName}, Welcome to our educational management system. Your account has been successfully created with the role of ${role}.`,
	}),

	// Password reset
	passwordReset: (userName: string, resetToken: string): EmailTemplate => ({
		subject: 'Password Reset Request',
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h2 style="color: #333;">Password Reset Request</h2>
				<p>Hello ${userName},</p>
				<p>You have requested to reset your password. Click the link below to reset your password:</p>
				<p><a href="${env.frontendUrl}/reset-password?token=${resetToken}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
				<p>If you didn't request this, please ignore this email.</p>
				<p>This link will expire in 1 hour.</p>
				<br>
				<p>Best regards,<br>E-System Team</p>
			</div>
		`,
		text: `Password Reset Request. Hello ${userName}, You have requested to reset your password. Please visit ${env.frontendUrl}/reset-password?token=${resetToken} to reset your password.`,
	}),

	// Course enrollment
	courseEnrollment: (
		userName: string,
		courseTitle: string,
		courseCode: string
	): EmailTemplate => ({
		subject: 'Course Enrollment Confirmation',
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h2 style="color: #333;">Course Enrollment Confirmation</h2>
				<p>Hello ${userName},</p>
				<p>You have been successfully enrolled in the following course:</p>
				<div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
					<h3 style="margin: 0; color: #333;">${courseTitle}</h3>
					<p style="margin: 5px 0; color: #666;">Course Code: ${courseCode}</p>
				</div>
				<p>You can now access the course materials and participate in class activities.</p>
				<br>
				<p>Best regards,<br>E-System Team</p>
			</div>
		`,
		text: `Course Enrollment Confirmation. Hello ${userName}, You have been successfully enrolled in ${courseTitle} (${courseCode}).`,
	}),

	// Grade notification
	gradeNotification: (
		userName: string,
		courseTitle: string,
		gradeType: string,
		score: number,
		maxScore: number
	): EmailTemplate => ({
		subject: 'New Grade Posted',
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h2 style="color: #333;">New Grade Posted</h2>
				<p>Hello ${userName},</p>
				<p>A new grade has been posted for your course:</p>
				<div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
					<h3 style="margin: 0; color: #333;">${courseTitle}</h3>
					<p style="margin: 5px 0; color: #666;">Assessment: ${gradeType}</p>
					<p style="margin: 5px 0; color: #666;">Score: ${score}/${maxScore}</p>
					<p style="margin: 5px 0; color: #666;">Percentage: ${((score / maxScore) * 100).toFixed(1)}%</p>
				</div>
				<p>Log in to your account to view the complete grade details.</p>
				<br>
				<p>Best regards,<br>E-System Team</p>
			</div>
		`,
		text: `New Grade Posted. Hello ${userName}, A new grade has been posted for ${courseTitle}. Assessment: ${gradeType}, Score: ${score}/${maxScore}.`,
	}),

	// Announcement notification
	announcementNotification: (
		userName: string,
		announcementTitle: string,
		announcementContent: string
	): EmailTemplate => ({
		subject: 'New Announcement',
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h2 style="color: #333;">New Announcement</h2>
				<p>Hello ${userName},</p>
				<p>A new announcement has been posted:</p>
				<div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
					<h3 style="margin: 0; color: #333;">${announcementTitle}</h3>
					<p style="margin: 10px 0; color: #333;">${announcementContent}</p>
				</div>
				<p>Log in to your account to view all announcements.</p>
				<br>
				<p>Best regards,<br>E-System Team</p>
			</div>
		`,
		text: `New Announcement. Hello ${userName}, A new announcement has been posted: ${announcementTitle}. ${announcementContent}`,
	}),
};

// Send welcome email
export const sendWelcomeEmail = async (
	userEmail: string,
	userName: string,
	role: string
): Promise<void> => {
	const template = emailTemplates.welcome(userName, userEmail, role);
	await sendEmail({
		to: userEmail,
		subject: template.subject,
		html: template.html,
		text: template.text,
	});
};

// Send password reset email
export const sendPasswordResetEmail = async (
	userEmail: string,
	userName: string,
	resetToken: string
): Promise<void> => {
	const template = emailTemplates.passwordReset(userName, resetToken);
	await sendEmail({
		to: userEmail,
		subject: template.subject,
		html: template.html,
		text: template.text,
	});
};

// Send course enrollment email
export const sendCourseEnrollmentEmail = async (
	userEmail: string,
	userName: string,
	courseTitle: string,
	courseCode: string
): Promise<void> => {
	const template = emailTemplates.courseEnrollment(
		userName,
		courseTitle,
		courseCode
	);
	await sendEmail({
		to: userEmail,
		subject: template.subject,
		html: template.html,
		text: template.text,
	});
};

// Send grade notification email
export const sendGradeNotificationEmail = async (
	userEmail: string,
	userName: string,
	courseTitle: string,
	gradeType: string,
	score: number,
	maxScore: number
): Promise<void> => {
	const template = emailTemplates.gradeNotification(
		userName,
		courseTitle,
		gradeType,
		score,
		maxScore
	);
	await sendEmail({
		to: userEmail,
		subject: template.subject,
		html: template.html,
		text: template.text,
	});
};

// Send announcement notification email
export const sendAnnouncementNotificationEmail = async (
	userEmails: string[],
	userName: string,
	announcementTitle: string,
	announcementContent: string
): Promise<void> => {
	const template = emailTemplates.announcementNotification(
		userName,
		announcementTitle,
		announcementContent
	);
	await sendEmail({
		to: userEmails,
		subject: template.subject,
		html: template.html,
		text: template.text,
	});
};
