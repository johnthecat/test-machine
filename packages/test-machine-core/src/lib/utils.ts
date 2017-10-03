import { createHash } from 'crypto';

export const getHash = (source: string): string => {
    return createHash('md5').update(source).digest('hex');
};

export const isNull = (value: any): value is null => {
    return value === null;
};

export const isUndefined = (value: any): value is undefined => {
    return value === void 0;
};

export const isNullOrUndefined = (value: any): value is null | undefined => {
    return (
        value === null ||
        value === void 0
    );
};
