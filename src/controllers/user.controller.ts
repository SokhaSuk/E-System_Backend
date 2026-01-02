/**
 * User management controllers for school system.
 * Controllers are thin HTTP handlers that delegate to the service layer.
 */
import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import {
	CreateUserDto,
	UpdateUserDto,
	ChangePasswordDto,
	UserFilterDto,
} from '../dto/user/user.dto';
import {
	parsePaginationOptions,
	buildPaginatedResponse,
} from '../utils/pagination';

export async function listUsers(req: Request, res: Response) {
	const filter: UserFilterDto = {
		role: req.query.role as any,
		search: req.query.search as string,
	};

	const pagination = parsePaginationOptions(req.query);

	const { users, total } = await userService.listUsers(
		filter,
		pagination,
		req.user!
	);

	return res.json(buildPaginatedResponse(users, total, pagination));
}

export async function getUser(req: Request, res: Response) {
	const user = await userService.getUserById(req.params.id, req.user!);
	return res.json(user);
}

export async function createUser(req: Request, res: Response) {
	const dto: CreateUserDto = req.body;
	const user = await userService.createUser(dto, req.user!);
	return res.status(201).json(user);
}

export async function updateUser(req: Request, res: Response) {
	const dto: UpdateUserDto = req.body;
	const user = await userService.updateUser(req.params.id, dto, req.user!);
	return res.json(user);
}

export async function changePassword(req: Request, res: Response) {
	const dto: ChangePasswordDto = req.body;
	const result = await userService.changePassword(
		req.params.id,
		dto,
		req.user!
	);
	return res.json(result);
}

export async function deleteUser(req: Request, res: Response) {
	const result = await userService.deleteUser(req.params.id, req.user!);
	return res.json(result);
}

export async function getUserProfile(req: Request, res: Response) {
	const user = await userService.getUserProfile(req.user!._id.toString());
	return res.json(user);
}

export async function updateUserProfile(req: Request, res: Response) {
	const dto: UpdateUserDto = req.body;
	const user = await userService.updateUserProfile(
		req.user!._id.toString(),
		dto
	);
	return res.json(user);
}

export async function changeUserProfilePassword(req: Request, res: Response) {
	const dto: ChangePasswordDto = req.body;
	const result = await userService.changeUserProfilePassword(
		req.user!._id.toString(),
		dto
	);
	return res.json(result);
}

export async function uploadProfilePicture(req: Request, res: Response) {
	if (!req.file) {
		return res.status(400).json({ error: 'No file uploaded' });
	}

	const avatarUrl = await userService.updateProfilePicture(
		req.user!._id.toString(),
		req.file
	);

	return res.json({
		message: 'Profile picture uploaded successfully',
		avatarUrl,
	});
}

