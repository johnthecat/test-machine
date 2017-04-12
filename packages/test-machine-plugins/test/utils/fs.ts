import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../');

export const readFile = (source: string): Promise<string> => {
    const normalizedPath = path.resolve(ROOT, source);

    return new Promise((resolve, reject) => {
        fs.readFile(normalizedPath, 'utf8', (err, file) => {
            if (err) {
                reject(err);
            } else {
                resolve(file);
            }
        });
    });
};

export const resolve = (file) => path.resolve(ROOT, file);