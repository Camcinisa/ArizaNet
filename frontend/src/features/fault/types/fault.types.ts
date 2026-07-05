export type FaultSolution = {
    id: number;
    deviceModelId?: number;
    deviceModel: string;
    errorCode: string;
    title: string;
    shortDescription?: string;
    description?: string;
    possibleCauses?: string;
    solutionSteps?: string;
    requiredTools?: string;
    warnings?: string;
    createdAt?: string;
    updatedAt?: string;
};

export type FaultSearchParams = {
    query: string;
};

export type FaultSolutionPayload = {
    deviceModelId: number;
    errorCode: string;
    title: string;
    description: string;
    possibleCauses: string;
    solutionSteps: string;
    requiredTools?: string;
    warnings?: string;
};
