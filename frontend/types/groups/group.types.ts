// Group Management Types

export interface ADGroupMapping {
    id: string;
    adGroupName: string;
    adGroupId: string;
    internalGroup: InternalGroup;
    internalGroupDisplay: string;
    isActive: boolean;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export type InternalGroup = 'candidate' | 'general_staff' | 'hr' | 'admin';

export interface InternalGroupChoice {
    value: InternalGroup;
    display: string;
}

export interface AvailableADGroup {
    adGroupId: string;
    adGroupName: string;
    isMapped: boolean;
}

export interface GroupMappingFormData {
    adGroupName: string;
    adGroupId: string;
    internalGroup: InternalGroup;
    isActive: boolean;
    description?: string;
}

export interface GroupMappingsResponse {
    count: number;
    canEdit: boolean;
    mappings: ADGroupMapping[];
}

export interface AvailableADGroupsResponse {
    count: number;
    mappedCount: number;
    unmappedCount: number;
    groups: AvailableADGroup[];
}

export interface InternalGroupChoicesResponse {
    choices: InternalGroupChoice[];
}

export interface CreateUpdateMappingResponse {
    message: string;
    created: number;
    updated: number;
    errors?: Array<{
        adGroupId: string;
        error: string;
    }> | null;
    mappings: ADGroupMapping[];
}

export interface DeleteMappingResponse {
    message: string;
}

export interface UpdateMappingResponse {
    message: string;
    mapping: ADGroupMapping;
}
