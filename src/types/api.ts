export type UserType = 'user' | 'company';
export type UserRole = 'user' | 'company' | 'admin';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  type: UserType;
  role: UserRole;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type ApiSuccess<T> = {
  status: 'success';
  message?: string;
  data: T;
};

export type ApiError = {
  success?: false;
  status?: 'error';
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
};

export type JobStatus = 'OPEN' | 'PAUSED' | 'CLOSED' | 'CANCELLED';
export type JobPaymentType = 'FIXED_RANGE' | 'HOURLY';

export type ApplicationStatus =
  | 'PENDING'
  | 'REVIEWED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED';

export type SkillLevel = 'BASICO' | 'INTERMEDIARIO' | 'AVANCADO' | 'ESPECIALISTA';

export type Technology = {
  id: string;
  name: string;
  slug: string;
  category?: string;
};

export type JobTechnology = {
  type: 'REQUIRED' | 'DESIRABLE';
  technology: Technology;
};

export type Job = {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  deadline: string;
  expiresAt: string;
  isActive: boolean;
  isFilled: boolean;
  status: JobStatus;
  paymentType?: JobPaymentType | null;
  budgetMin?: number | string | null;
  budgetMax?: number | string | null;
  hourlyRate?: number | string | null;
  currency?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  technologies?: JobTechnology[];
  company?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
  _count?: { applications: number };
};

export type Application = {
  id: string;
  status: ApplicationStatus;
  resumeUrl: string | null;
  coverLetter: string | null;
  companyCompletedAt?: string | null;
  userCompletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  jobId: string;
  userId: string;
  job?: Job & {
    company?: {
      id: string;
      name: string;
      email?: string | null;
      phone?: string | null;
      avatarUrl?: string | null;
    };
  };
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    avatarUrl?: string | null;
    bio?: string | null;
  };
  matchScore?: number;
  matchPercent?: number;
  matchedTechnologies?: string[];
};

export type Notification = {
  id: string;
  type: string;
  content: string;
  data?: Record<string, unknown> | null;
  read: boolean;
  createdAt: string;
};

export type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewerType?: 'USER' | 'COMPANY';
  reviewedType?: 'USER' | 'COMPANY';
  reviewer?: { id: string; name: string };
};

export type ApplicationReviewStatus = {
  applicationId: string;
  status: ApplicationStatus;
  userReviewed: boolean;
  companyReviewed: boolean;
  userReview: Review | null;
  companyReview: Review | null;
  canReview: boolean;
};

export type ReviewSummary = {
  averageRating: number;
  totalReviews: number;
  distribution: Record<string, number>;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  resumeUrl?: string | null;
  cpf?: string;
  cnpj?: string;
  segment?: string | null;
  website?: string | null;
  techStack?: Array<{
    level: SkillLevel;
    technology: Technology;
  }>;
  experiences?: Experience[];
  portfolio?: PortfolioItem[];
};

export type Experience = {
  id: string;
  companyName: string;
  roleTitle?: string | null;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  current?: boolean;
};

export type CreateExperiencePayload = {
  companyName: string;
  roleTitle: string;
  description?: string;
  startDate: string;
  endDate?: string | null;
};

export type PortfolioItem = {
  id: string;
  title: string;
  description?: string | null;
  url?: string | null;
  imageUrl?: string | null;
};

export type RecommendedCandidate = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  resumeUrl?: string | null;
  matchScore: number;
  matchPercent: number;
  matchedTechnologies: string[];
};

export type MatchingJob = Job & {
  matchScore?: number;
  matchPercent: number;
  matchedTechnologies?: string[];
};

/** @deprecated Use RecommendedCandidate for matching API responses */
export type MatchingCandidate = Application & {
  matchScore?: number;
  matchPercent?: number;
  matchedTechnologies?: string[];
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  isBlocked: boolean;
  isActive: boolean;
  createdAt: string;
};
