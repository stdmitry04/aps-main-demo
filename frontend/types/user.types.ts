export interface User {
    id: string
    districtId: string
    email: string
    firstName: string
    lastName: string
    isEmailVerified: boolean
    dateJoined: string
    entraId?: string | null
    adGroups: string[]
    adGroupIds: string[]
    adGroupsSyncedAt?: string | null
    jobTitle?: string | null
    department?: string | null
    internalGroups: string[]
    canEditGroupMappings: boolean
    role: 'hr' | 'admin' | 'general_staff' | 'candidate'
}
