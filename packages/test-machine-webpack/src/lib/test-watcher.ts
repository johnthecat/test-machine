import * as path from 'path';
import * as process from 'process';
import * as Watchpack from 'watchpack';

class TestWatcher {

    private watcher: any;

    constructor(private roots: Array<string>) {
    }

    public setup(callback: Function): void {
        const paths = this.roots.map((root) => path.resolve(root));

        this.watcher = new Watchpack({
            aggregateTimeout: 500
        });

        this.watcher.watch([], paths, Date.now());
        this.watcher.on('aggregated', () => {
            callback();
        });

        process.on('exit', () => {
            this.watcher.close();
        });
    }
}

export {TestWatcher};
