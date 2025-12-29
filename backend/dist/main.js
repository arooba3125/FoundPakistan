"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: ['http://localhost:3000'],
        credentials: true,
    });
    app.setGlobalPrefix('api');
    app.use((req, res, next) => {
        req.on('data', () => { });
        next();
    });
    const json = require('body-parser').json({ limit: '50mb' });
    const urlencoded = require('body-parser').urlencoded({ limit: '50mb', extended: true });
    app.use(json);
    app.use(urlencoded);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const port = process.env.APP_PORT ?? 3001;
    await app.listen(port);
    console.log(`✅ Backend running on http://localhost:${port}/api`);
}
bootstrap().catch((err) => {
    console.error('❌ Failed to start backend:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map