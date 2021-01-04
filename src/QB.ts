import { issue_folder, IIssue } from "./main";

export type MapFunction<T = any, V = any> = (i: T) => Promise<[V, boolean]>; // value and early exit
export type FilterFunction<T = any> = (i: T) => Promise<[boolean, boolean]>; // value and early exit
export type ReduceFunction<T = any, V = any> = (
	i: T,
	acc: V
) => Promise<[V, boolean]>;
export interface IMapFunc {
	type: "Map";
	fn: MapFunction;
}
export interface IFilterFunc {
	type: "Filter";
	fn: FilterFunction;
}
export interface IReduceFunc {
	type: "Reduce";
	fn: ReduceFunction;
	acc: any;
}
export class QB {
	reader: IIssueReader;
	stages: (IFilterFunc | IMapFunc | IReduceFunc)[] = [];

	map(fn: MapFunction) {
		this.stages.push({
			type: "Map",
			fn: fn
		});
		return this;
	}

	filter(fn: FilterFunction) {
		this.stages.push({
			type: "Filter",
			fn: fn
		});
		return this;
	}

	reduce<V>(fn: ReduceFunction, acc: V) {
		this.stages.push({
			type: "Reduce",
			fn: fn,
			acc: acc
		});
		return this;
	}

	async next(): Promise<{ done: boolean; value: any }> {
		const i = await this.reader.next();
		if (!i.done) {
			return i;
		}
		let stageVar: any = i.value;
		for (const s of this.stages) {
			if (s.type === "Map") {
				stageVar = await s.fn(stageVar);
			} else if (s.type === "Filter") {
				//
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
}

export interface IIssueReader {
	next(): Promise<{ done: boolean; value: undefined | IIssue }>;
	[Symbol.asyncIterator](): IIssueReader;
}

export class FileIssueReader {
	folder: string;

	constructor(folder?: string) {
		this.folder = folder || issue_folder;
	}

	async next() {
		return { done: true, value: undefined };
	}

	[Symbol.asyncIterator]() {
		return this;
	}
}
