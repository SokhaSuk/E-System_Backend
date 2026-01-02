/**
 * Exercise controllers.
 * Controllers are thin HTTP handlers that delegate to the service layer.
 */
import { Request, Response } from 'express';
import { exerciseService } from '../services/exercise.service';
import {
    CreateExerciseDto,
    UpdateExerciseDto,
    ExerciseFilterDto,
    SubmitExerciseDto,
    GradeSubmissionDto,
} from '../dto/exercise/exercise.dto';
import {
    parsePaginationOptions,
    buildPaginatedResponse,
} from '../utils/pagination';

export async function listExercises(req: Request, res: Response) {
    const filter: ExerciseFilterDto = {
        course: req.query.course as string,
        createdBy: req.query.createdBy as string,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        search: req.query.search as string,
    };

    const pagination = parsePaginationOptions(req.query);

    const { exercises, total } = await exerciseService.listExercises(
        filter,
        pagination,
        req.user!
    );

    return res.json(buildPaginatedResponse(exercises, total, pagination));
}

export async function getExercise(req: Request, res: Response) {
    const exercise = await exerciseService.getExerciseById(
        req.params.id,
        req.user!
    );
    return res.json(exercise);
}

export async function createExercise(req: Request, res: Response) {
    const dto: CreateExerciseDto = req.body;
    const exercise = await exerciseService.createExercise(dto, req.user!);
    return res.status(201).json(exercise);
}

export async function updateExercise(req: Request, res: Response) {
    const dto: UpdateExerciseDto = req.body;
    const exercise = await exerciseService.updateExercise(
        req.params.id,
        dto,
        req.user!
    );
    return res.json(exercise);
}

export async function deleteExercise(req: Request, res: Response) {
    const result = await exerciseService.deleteExercise(req.params.id, req.user!);
    return res.json(result);
}

export async function uploadAttachment(req: Request, res: Response) {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const exercise = await exerciseService.addAttachment(
        req.params.id,
        req.file,
        req.user!
    );

    return res.json(exercise);
}

export async function submitExercise(req: Request, res: Response) {
    const dto: SubmitExerciseDto = req.body;
    const files = req.files as Express.Multer.File[];

    const submission = await exerciseService.submitExercise(
        req.params.id,
        dto,
        files || [],
        req.user!
    );

    return res.status(201).json(submission);
}

export async function gradeSubmission(req: Request, res: Response) {
    const dto: GradeSubmissionDto = req.body;
    const submission = await exerciseService.gradeSubmission(
        req.params.exerciseId,
        req.params.submissionId,
        dto,
        req.user!
    );
    return res.json(submission);
}

export async function getSubmissions(req: Request, res: Response) {
    const submissions = await exerciseService.getSubmissions(
        req.params.id,
        req.user!
    );
    return res.json(submissions);
}

export async function getMySubmission(req: Request, res: Response) {
    const submission = await exerciseService.getMySubmission(
        req.params.id,
        req.user!
    );
    return res.json(submission);
}
