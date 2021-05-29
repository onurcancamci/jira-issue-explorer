import { readFileSync, writeFileSync, writeSync } from "fs";
import { PorterStemmer } from "natural";
import { IBIssue, IComment, SanitizeIssue } from "./IssueUtil";
import { HiveQBBuilder, SHiveQBBuilder } from "./QB";
const ngram: {
	bigram: (arr: string[]) => string[][];
	trigram: (arr: string[]) => string[][];
} = require("n-gram");

interface IStem {
	issue: IBIssue;
	grams: string[][];
	gramsSet: Set<string>[];
	hasCode: boolean;
	effort: {
		mainManHour: number;
		manHour: number;
		count: number;
	};
	freq: Record<string, number>[];
	binary: Record<string, boolean>[];
	commentCount: number;
}

function incr(obj: any, key: string) {
	if (!obj[key]) {
		obj[key] = 0;
	}
	obj[key]++;
}

export class Process {
	static FindOutliers(stems: IStem[]) {
		const grams: Record<string, number>[] = [{}, {}, {}];
		for (const s of stems) {
			for (let gid = 0; gid < grams.length; gid++) {
				for (const word of s.gramsSet[gid]) {
					incr(grams[gid], word);
				}
			}
		}
		const total = stems.length;
		const max = total * 0.95;
		const min = total * 0.05;
		const outliers: Record<string, boolean>[] = [{}, {}, {}];
		const normals: Record<string, boolean>[] = [{}, {}, {}];
		for (let gid = 0; gid < grams.length; gid++) {
			for (const word in grams[gid]) {
				const val = grams[gid][word];
				if (val > max || val < min) {
					outliers[gid][word] = true;
				} else {
					normals[gid][word] = true;
				}
			}
		}
		return { normals, outliers };
	}

	static async Init() {
		// const issues = await HiveQBBuilder()
		// 	.filter((e) => {
		// 		return fixedIssues(SanitizeIssue(e));
		// 	})
		// 	.collect();
		// writeFileSync("./issues.json", JSON.stringify(issues));
		//const stems = await SHiveQBBuilder()
		//	.filter(fixedIssues)
		const issues: IBIssue[] = JSON.parse(
			readFileSync("./issues.json", "utf-8")
		).map(SanitizeIssue);
		let outliers: {
			normals: Record<string, boolean>[];
			outliers: Record<string, boolean>[];
		} = JSON.parse(readFileSync("./outliersObj.json", "utf8"));

		const stems = issues.map((i) => {
			let st = PorterStemmer.tokenizeAndStem(i.description);
			const bigram = ngram
				.bigram(st)
				.map((ws) => ws.join(" "))
				.filter((s) => outliers.normals[1][s]);
			const trigram = ngram
				.trigram(st)
				.map((ws) => ws.join(" "))
				.filter((s) => outliers.normals[2][s]);
			st = st.filter((s) => outliers.normals[0][s] && s !== "constructor");
			return {
				issue: i,
				grams: [st, bigram, trigram],
				gramsSet: [new Set(st), new Set(bigram), new Set(trigram)],
				hasCode: i.description.includes("{code}"),
				effort: findManHour(i),
				freq: [{}, {}, {}] as Record<string, number>[],
				binary: [{}, {}, {}] as Record<string, boolean>[],
				commentCount: i.comments.length
			};
		});
		//.take(40);
		// writeFileSync(
		// 	"./outliersObj.json",
		// 	JSON.stringify(this.FindOutliers(stems))
		// );

		const grams: Record<string, number>[] = [{}, {}, {}];

		for (let gid = 0; gid < grams.length; gid++) {
			for (const s of stems) {
				const sgrams: Record<string, number>[] = [{}, {}, {}];
				for (const str of s.grams[gid]) {
					incr(grams[gid], str);
					incr(sgrams[gid], str);
				}
				s.freq = sgrams;
			}
		}

		// add all to freq and construct bin
		for (let gid = 0; gid < grams.length; gid++) {
			const gram = grams[gid];
			for (const str in gram) {
				stems.forEach((s) => {
					// add 0 as freq
					// add true/false
					if (!s.freq[gid][str]) {
						s.freq[gid][str] = 0;
						s.binary[gid][str] = false;
					} else {
						s.binary[gid][str] = true;
					}
				});
			}
		}

		console.log(
			Object.keys(stems[0].freq[0]).length,
			Object.keys(stems[0].freq[1]).length,
			Object.keys(stems[0].freq[2]).length,
			stems[0].freq
		);
	}

	static BuildDataset(stems: IStem[], def: IDateSetDef) {}
}

type IDateSetDef = { gid: number; type: "bin" | "freq" }[];

export async function fixedIssues(i: IBIssue) {
	return (
		i.comments.length >= 5 &&
		!!i.resolution &&
		i.resolution == "Fixed" &&
		i.issueType == "Bug" &&
		i.priority == "Major" &&
		!!i.description &&
		i.description.length >= 100
	);
}

export function findManHour(i: IBIssue) {
	const start = i.created.getTime();
	const end = i.resolutionDate!.getTime();
	const mainMH = (end - start) / 3600 / 1000;
	let mh = mainMH;
	const contributors = new Set();
	contributors.add(i.creator.key);

	i.comments.sort(compareDatesAsc);
	for (const c of i.comments) {
		if (contributors.has(c.author.key)) {
			continue;
		}
		const cs = sToTime(c.created);
		if (end < cs) {
			continue;
		}
		const cmh = (end - cs) / 3600 / 1000;
		mh += cmh;
		contributors.add(c.author.key);
	}

	return { mainManHour: mainMH, manHour: mh, count: contributors.size };
}

function compareDatesAsc(a: IComment, b: IComment) {
	return sToTime(a.created) - sToTime(b.created);
}

function sToTime(s: string) {
	return new Date(s).getTime();
}
