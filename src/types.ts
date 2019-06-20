interface Unit<T = undefined> {
    (prevValue?: T): T extends undefined?
        {
            result?: undefined;
            next: NextUnit<T>;
        } :
        {
            result: T;
            next: NextUnit<T>;
        };
}

type NextUnit<T> = Unit<T> | null;

interface Task<T> {
    run(): Promise<T>;
    abort(): void;
}

export {
    Unit,
    NextUnit,
    Task
};
