import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    getHealth(): Promise<{
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
