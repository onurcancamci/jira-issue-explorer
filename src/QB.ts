import { issue_folder, IIssue } from "./main";
import { readdirSync } from "fs";
import { join } from "path";
import { readFile } from "fs/promises";

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

	//will consume
	async reduce<V>(fn: ReduceFunction<El<T>, V>, acc: V): Promise<V> {
		for await (const val of this) {
			acc = await fn(val, acc);
		}
		return acc;
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

export interface IIssueReader {
	next(): Promise<{ done: boolean; value: undefined | IIssue }>;
	[Symbol.asyncIterator](): IIssueReader;
}

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
