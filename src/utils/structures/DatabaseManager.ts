import { DataSource } from "typeorm";
import { Note } from "../../database/entities/Note.js";
import { Permission } from "../../database/entities/Permission.js";
import { Rawon } from "../../structures/Rawon.js";

export class DatabaseManager {
    public db = new DataSource({
        type: "postgres",
        host: this.client.config.dbHost,
        port: this.client.config.dbPort,
        username: this.client.config.dbUsername,
        password: this.client.config.dbPassword,
        database: this.client.config.dbName,
        logger: "advanced-console",
        logging: ["error", "info", "warn"],
        entities: [Note, Permission]
    });

    public constructor(public client: Rawon) {}

    public initialize(): void {
        this.checkConfig();
        this.connect();
    }

    private checkConfig(): void {
        if (this.client.config.dbName === "") {
            this.client.logger.warn("Db Name is required");
        }

        if (this.client.config.dbUsername === "") {
            this.client.logger.warn("Db Username is required");
        }

        if (this.client.config.dbPassword === "") {
            this.client.logger.warn("Db password is required");
        }
    }

    private async checkEnviornment(): Promise<void> {
        if (this.client.config.isDev) {
            this.client.logger.warn("Running in dev mode, synchronizing database");
            await this.db.synchronize(true);
        }
    }

    private connect(): void {
        this.db
            .initialize()
            .then(() => {
                this.client.logger.info("Connected to database!");
                void this.checkEnviornment();
            })
            .catch(error => {
                if (error instanceof Error) {
                    this.client.logger.error(error.message);
                }
            });
    }
}
