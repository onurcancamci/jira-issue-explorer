import * as express from "express";
import * as cors from "cors";

export class Server {
	static app: express.Application = express();

	static async Init() {
		this.app.use(cors({ origin: "*" }));
		this.app.all("/", (req, res) => {
			res.end("Working");
		});
		this.app.listen(5000);
	}

	static async AddData(data: Record<string, any>, path: string) {
		this.app.all(path, (req, res) => {
			res.json(data);
		});
	}
}
