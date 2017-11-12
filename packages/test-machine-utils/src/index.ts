
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

export const isFunction = (value: any): value is Function => {
    return typeof value === 'function';
};

export const isString = (value: any): value is string => {
    return typeof value === 'string';
};
