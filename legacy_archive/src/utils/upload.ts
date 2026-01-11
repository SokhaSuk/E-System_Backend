/**
 * File upload utilities using multer.
 */
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Express } from 'express';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
	destination: (req: Request, file: Express.Multer.File, cb) => {
		// Create subdirectories based on file type
		let subDir = 'general';
		if (file.fieldname === 'profile') {
			subDir = 'profiles';
		} else if (file.fieldname === 'assignment') {
			subDir = 'assignments';
		} else if (file.fieldname === 'announcement') {
			subDir = 'announcements';
		} else if (file.fieldname === 'course') {
			subDir = 'courses';
		} else if (file.fieldname === 'exercise') {
			subDir = 'exercises';
		} else if (file.fieldname === 'submission') {
			subDir = 'submissions';
		}

		const fullPath = path.join(uploadsDir, subDir);
		if (!fs.existsSync(fullPath)) {
			fs.mkdirSync(fullPath, { recursive: true });
		}
		cb(null, fullPath);
	},
	filename: (req: Request, file: Express.Multer.File, cb) => {
		// Generate unique filename
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		const name = path.basename(file.originalname, ext);
		cb(null, `${name}-${uniqueSuffix}${ext}`);
	},
});

// File filter function
const fileFilter = (
	req: Request,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback
) => {
	// Allowed file types
	const allowedTypes = [
		'image/jpeg',
		'image/jpg',
		'image/png',
		'image/gif',
		'image/heic',
		'image/heif',
		'application/pdf',
		'application/msword',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'application/vnd.ms-excel',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		'text/plain',
		'text/csv',
	];

	if (allowedTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(
			new Error(
				'Invalid file type. Only images, PDFs, and Office documents are allowed.'
			)
		);
	}
};

// Configure multer
export const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB limit
		files: 5, // Maximum 5 files per request
	},
});

// Single file upload
export const uploadSingle = (fieldName: string) => upload.single(fieldName);

// Multiple files upload
export const uploadMultiple = (fieldName: string, maxCount: number = 5) =>
	upload.array(fieldName, maxCount);

// Specific upload configurations
export const profileUpload = upload.single('profile');
export const assignmentUpload = upload.array('assignment', 5);
export const announcementUpload = upload.array('announcement', 3);
export const courseUpload = upload.array('course', 10);
export const exerciseUpload = upload.single('exercise');
export const submissionUpload = upload.array('submission', 5);

// File deletion utility
export const deleteFile = (filePath: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		fs.unlink(filePath, err => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
};

// Get file URL
export const getFileUrl = (filePath: string): string => {
	const relativePath = path.relative(process.cwd(), filePath);
	return `/uploads/${relativePath.replace(/\\/g, '/')}`;
};

// Validate file size
export const validateFileSize = (
	file: Express.Multer.File,
	maxSize: number = 10 * 1024 * 1024
): boolean => {
	return file.size <= maxSize;
};

// Get file extension
export const getFileExtension = (filename: string): string => {
	return path.extname(filename).toLowerCase();
};

// Check if file is image
export const isImage = (file: Express.Multer.File): boolean => {
	return file.mimetype.startsWith('image/');
};

// Check if file is PDF
export const isPDF = (file: Express.Multer.File): boolean => {
	return file.mimetype === 'application/pdf';
};

// Check if file is document
export const isDocument = (file: Express.Multer.File): boolean => {
	return (
		file.mimetype.includes('word') ||
		file.mimetype.includes('excel') ||
		file.mimetype.includes('spreadsheet')
	);
};
