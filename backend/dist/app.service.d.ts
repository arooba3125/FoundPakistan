import { DataSource } from 'typeorm';
export declare class AppService {
    private dataSource;
    constructor(dataSource: DataSource);
    getHello(): string;
    checkHealth(): Promise<{
        status: string;
        database: string;
        timestamp: string;
        query_result: any;
        error?: undefined;
    } | {
        status: string;
        database: string;
        timestamp: string;
        error: any;
        query_result?: undefined;
    }>;
}
