import * as path from 'path';
import * as process from 'process';
import * as Watchpack from 'watchpack';

class TestWatcher {

    private watcher: any;

    constructor(private root: string) {
    }

    public setup(callback: Function): void {
        this.watcher = new Watchpack({
            aggregateTimeout: 500
        });

        this.watcher.watch([], [path.resolve(this.root)], Date.now());
        this.watcher.on('aggregated', () => {
            callback();
        });

        process.on('exit', () => {
            this.watcher.close();
        });
    }
}

export {TestWatcher};