import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['STUDENT', 'ADMIN']).default('STUDENT'),
})

export const createLeadSchema = z.object({
  guideId: z.string().uuid('Invalid guide'),
  studentName: z.string().min(1, 'Name is required'),
  studentEmail: z.string().email('Invalid email'),
  studentPhone: z.string().optional(),
  gpa: z.number().min(0).max(4).optional(),
  currentSchoolId: z.string().optional(),
})

export const sendOfferSchema = z.object({
  offerType: z.enum(['DIRECT_ACCEPTANCE', 'TRANSFER_SCHOLARSHIP']),
  scholarshipAmount: z.number().min(0).optional(),
})
