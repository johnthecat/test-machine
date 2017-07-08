import {readFile as fsRead} from 'fs';
import {resolve} from 'path';

const ROOT = resolve(__dirname, '../');

export const readFile = (source: string): Promise<string> => {
    const normalizedPath = resolve(ROOT, source);

    return new Promise((resolve, reject) => {
        fsRead(normalizedPath, 'utf8', (err: Error, file: string) => {
            if (err) {
                reject(err);
            } else {
                resolve(file);
            }
        });
    });
};
