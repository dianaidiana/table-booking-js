export type PartialWithUndefined<T> = {
    [K in keyof T]?: T[K] | undefined;
};
