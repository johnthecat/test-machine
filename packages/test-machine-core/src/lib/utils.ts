import {createHash} from 'crypto';

export const getHash = (source: string): string => {
    return createHash('md5').update(source).digest('hex');
};