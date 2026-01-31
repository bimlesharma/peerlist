// IPU Portal API Types

export interface IPUResult {
    stname: string;
    nrollno: string;
    fathersname?: string;
    instname?: string;
    iname?: string;  // Alternative institute name field
    progname?: string;
    prgname?: string;  // Alternative program name field
    batch?: string;
    yoa?: string;  // Year of admission (alternative batch field)
    byoa?: string;  // Another alternative for batch/year of admission
    papercode: string;
    papername: string;
    minorprint: string;  // Internal marks
    majorprint: string;  // External marks
    moderatedprint: string;  // Total marks
    eugpa: string;  // Grade points
    declareddate: string;
    semname?: string;
    euno?: number | string;  // Semester number (1-8)
    credits?: string | number;
    stimage?: string;  // Student profile image (base64)
}

export interface CaptchaResponse {
    success: boolean;
    captchaImage?: string;
    sessionId?: string;
    message?: string;
}

export interface LoginResponse {
    success: boolean;
    message?: string;
    sessionId?: string;
}

export interface IPUResultsResponse {
    success: boolean;
    results?: IPUResult[];
    message?: string;
}
