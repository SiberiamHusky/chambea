export enum DatabaseCollectionNames {
  USER = 'usuarios',
  EMPLOYER = 'employers',
  COMPANY = 'companies',
  ADDRESS = 'addresses',
  WORKER = 'workers',
}

export enum UserType {
  WORKER = 'worker',
  EMPLOYER = 'employer',
  PENDING = 'pending',
}

export enum AccountStatus {
  PENDING_ROLE_SELECTION = 'pending_role_selection',
  PENDING_VERIFICATION = 'pending_verification',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive',
}

export enum EmployerType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company',
}

export enum CompanySize {
  STARTUP = 'startup',
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  ENTERPRISE = 'enterprise',
}

export enum Industry {
  TECHNOLOGY = 'technology',
  HEALTHCARE = 'healthcare',
  FINANCE = 'finance',
  EDUCATION = 'education',
  RETAIL = 'retail',
  MANUFACTURING = 'manufacturing',
  CONSTRUCTION = 'construction',
  HOSPITALITY = 'hospitality',
  TRANSPORTATION = 'transportation',
  AGRICULTURE = 'agriculture',
  ENERGY = 'energy',
  MEDIA = 'media',
  REAL_ESTATE = 'real_estate',
  CONSULTING = 'consulting',
  NON_PROFIT = 'non_profit',
  GOVERNMENT = 'government',
  OTHER = 'other',
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}
