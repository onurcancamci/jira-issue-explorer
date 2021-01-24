import { issue_folder, workbench_folder } from "./main";
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { readFile, writeFile } from "fs/promises";
import { IBIssue, IIssue, SanitizeIssue } from "./IssueUtil";

export type MapFunction<T = any, V = any> = (i: T) => Promise<V>;
export type FilterFunction<T = any> = (i: T) => Promise<boolean>;
export type ReduceFunction<T = any, V = any> = (i: T, acc: V) => Promise<V>;

type El<A> = A extends readonly (infer T)[] ? T : never;

export interface IMapFunc<I = any, O = any> {
	type: "Map";
	fn: MapFunction<I, O>;
}
export interface IFilterFunc<I = any> {
	type: "Filter";
	fn: FilterFunction<I>;
}

const SymFilterFail = Symbol("FilterFail");

export class QB<T = IIssue[]> {
	reader: IIssueReader;
	stages: (IFilterFunc | IMapFunc)[] = [];
	isCompleted = false;

	map<OUT>(fn: MapFunction<El<T>, OUT>) {
		this.stages.push({
			type: "Map",
			fn: fn
		});
		return (this as any) as QB<OUT[]>;
	}

	filter(fn: FilterFunction<El<T>>) {
		this.stages.push({
			type: "Filter",
			fn: fn
		});
		return this;
	}

	async find(fn: FilterFunction<El<T>>) {
		for await (const val of this) {
			if (await fn(val)) {
				return val as El<T>;
			}
		}
		return null;
	}

	//will consume
	async reduce<V>(fn: ReduceFunction<El<T>, V>, acc: V): Promise<V> {
		for await (const val of this) {
			acc = await fn(val, acc);
		}
		return acc;
	}

	async reduceWithCache<V>(
		fn: ReduceFunction<El<T>, V>,
		acc: V,
		cache: string,
		force = false
	) {
		const path = join(workbench_folder, `${cache}.json`);
		if (existsSync(path) && !force) {
			return JSON.parse(await readFile(path, "utf-8"));
		}
		const result = await this.reduce(fn, acc);
		await writeFile(path, JSON.stringify(result));
		return result;
	}

	async take(num: number) {
		const arr = [];
		for (let k = 0; k < num; k++) {
			const ret = await this.next();
			if (ret.done) {
				return arr;
			}

			arr.push(ret.value);
		}
		return arr;
	}

	async next(): Promise<{ done: boolean; value: any }> {
		let res;
		do {
			res = await this.pnext();
		} while (!res.done && res.value === SymFilterFail);
		return res;
	}

	private async pnext(): Promise<{ done: boolean; value: any }> {
		if (this.isCompleted) {
			return { done: true, value: undefined };
		}
		let i = await this.reader.next();
		if (i.done) {
			this.isCompleted = true;
			return i;
		}
		let stageVar: any = i.value;
		for (const s of this.stages) {
			if (s.type === "Map") {
				stageVar = await s.fn(stageVar);
			} else {
				const valid = await s.fn(stageVar);
				if (!valid) {
					return { done: false, value: SymFilterFail };
				}
			}
		}
		return { done: false, value: stageVar };
	}

	constructor(reader?: IIssueReader) {
		this.reader = reader || new FileIssueReader();
	}

	async test() {
		for await (const i of this.reader) {
			console.log(i);
		}
	}

	[Symbol.asyncIterator]() {
		return this;
	}
}

export interface IReader<T = any> {
	next(): Promise<{ done: boolean; value: T }>;
	[Symbol.asyncIterator](): IReader<T>;
}

export type IIssueReader = IReader<IIssue>;

export class FileIssueReader {
	folder: string;
	files: string[];
	index: number = 0;

	constructor(folder?: string, filter?: (s: string) => boolean) {
		this.folder = folder || issue_folder;
		this.files = readdirSync(this.folder);

		if (filter) {
			this.files = this.files.filter(filter);
		}
	}

	async progress() {
		return [this.index, this.files.length];
	}

	async next() {
		if (this.index < this.files.length) {
			const fp = join(this.folder, this.files[this.index]);
			const str = await readFile(fp, "utf8");
			const obj = JSON.parse(str);
			this.index++;
			return { done: false, value: obj };
		}
		return { done: true, value: undefined };
	}

	[Symbol.asyncIterator]() {
		return this;
	}
}

export const HiveQBBuilder = () => {
	const reader = new FileIssueReader(issue_folder, (s) => {
		return s.startsWith("HIVE");
	});

	const qb = new QB(reader);

	const int = setInterval(async () => {
		const progress = await reader.progress();
		const percent = (progress[0] / progress[1]) * 100;
		console.log(`Progress: ${percent.toFixed(2)}%`);
	}, 5000);

	return qb;
};

export const SHiveQBBuilder = () => {
	const qb = HiveQBBuilder();
	qb.map<IBIssue>(async (i) => SanitizeIssue(i));
	return (qb as any) as QB<IBIssue[]>;
};
