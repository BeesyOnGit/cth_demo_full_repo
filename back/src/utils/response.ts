export type PaginateResponseOption<T> = {
    payload: T[];
    total: number;
    page: number;
    limit: number;
};
export type PaginatedResult<T> = {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
    };
};

export function paginateResponse<T>({ payload, total, page, limit }: PaginateResponseOption<T>) {
    return {
        data: payload,
        pagination: {
            total,
            page: page / limit + 1,
            limit,
        },
    };
}
