import { Request, Response } from "express";
import { ScoreRecordModel, Semester, calculateSemesterScores } from "../models/ScoreRecord";
import mongoose from "mongoose";

/**
 * Create or Upsert ScoreRecord
 */
export const createScoreRecord = async (req: Request, res: Response) => {
    try {
        const { student, course, semesters } = req.body;

        // Calculate total and grade for each semester
        const calculatedSemesters = semesters?.map((sem: Semester) => calculateSemesterScores(sem)) || [];

        const record = new ScoreRecordModel({ student, course, semesters: calculatedSemesters });
        const saved = await record.save();

        res.status(201).json(saved);
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Record already exists for this student and course." });
        }
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get all ScoreRecords with Pagination & Filters
 */
export const getAllScoreRecords = async (req: Request, res: Response) => {
    try {
        const { student, course, page = 1, limit = 10 } = req.query;
        const query: any = {};

        if (student) query.student = student;
        if (course) query.course = course;

        const records = await ScoreRecordModel.find(query)
            .populate("student", "name email")
            .populate("course", "name code")
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .sort({ createdAt: -1 });

        const total = await ScoreRecordModel.countDocuments(query);

        res.json({
            data: records,
            pagination: { total, page: Number(page), limit: Number(limit) }
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Update a specific Semester within a Record (Full Replace)
 */
export const updateScoreRecord = async (req: Request, res: Response) => {
    try {
        const updated = await ScoreRecordModel.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!updated) return res.status(404).json({ message: "Record not found" });
        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Add a semester (Atomic Push)
 */
export const addSemester = async (req: Request, res: Response) => {
    try {
        const record = await ScoreRecordModel.findById(req.params.id);
        if (!record) return res.status(404).json({ message: "Record not found" });

        // Calculate total and grade before adding
        const calculatedSemester = calculateSemesterScores(req.body);
        record.semesters.push(calculatedSemester);
        const updated = await record.save();
        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Delete a specific semester from a record
 */
export const deleteSemester = async (req: Request, res: Response) => {
    try {
        const { id, semesterId } = req.params;
        const updated = await ScoreRecordModel.findByIdAndUpdate(
            id,
            { $pull: { semesters: { _id: semesterId } } },
            { new: true }
        );
        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Update a specific semester within a record
 */
export const updateSemester = async (req: Request, res: Response) => {
    try {
        const { id, semesterId } = req.params;
        const record = await ScoreRecordModel.findById(id);
        if (!record) return res.status(404).json({ message: "Record not found" });

        // Find the semester by ID
        const semester = (record.semesters as any).id(semesterId);
        if (!semester) return res.status(404).json({ message: "Semester not found" });

        // Update semester fields
        Object.assign(semester, req.body);

        // Recalculate total and grade
        const calculated = calculateSemesterScores(semester.toObject());
        semester.total = calculated.total;
        semester.grade = calculated.grade;

        const updated = await record.save();
        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteScoreRecord = async (req: Request, res: Response) => {
    try {
        const record = await ScoreRecordModel.findByIdAndDelete(req.params.id);
        if (!record) return res.status(404).json({ message: "Record not found" });
        res.json({ message: "Record deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getScoreRecordById = async (req: Request, res: Response) => {
    try {
        const record = await ScoreRecordModel.findById(req.params.id).populate("student course");
        if (!record) return res.status(404).json({ message: "Record not found" });
        res.json(record);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};