import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	writeFileSync
} from "fs";
import { writeFile } from "fs/promises";
import { platform } from "os";
import { join } from "path";
import { IBIssue, IComment, IIssue } from "./IssueUtil";
import { QB, FileIssueReader, HiveQBBuilder, SHiveQBBuilder } from "./QB";
import { Server } from "./Server";
import { PorterStemmer } from "natural";
import { Process } from "./Process";
const ngram: {
	bigram: (arr: string[]) => string[][];
	trigram: (arr: string[]) => string[][];
} = require("n-gram");

export const issue_folder = process.env.ISSUES || "../jira/issues";
export const issue_folder2 = process.env.ISSUES || "../jira/issues2";
export const workbench_folder = "./workbench";

// TODO:
// 1- Efor bul
// 2- Efor grafigi ciz
// 3- Efor ile tek kisi eforu arasindaki farki bulup birsey yap
// 4- NLP kelime koku bulan kutuphane incele
// 5- NLP ile kelime koklerini cikar

// P-value bak, t-test
//https://en.wikipedia.org/wiki/Kruskal%E2%80%93Wallis_one-way_analysis_of_variance
//kelimelerde filtreleme yap
//ml icin vector hazirlas

// yuzde kullanimina gore alti ve ustu ele 95-05%
// code block iceriyor mu feature
// row1: java: true, org: false, .... / alternative frequency java: 3, org: bug da gecme sayisi / word embedding
// bir cok veri seti alternatifi / unigram sadece bin / unigram + freq / bigram ... /
// makalelerden bakip vs duzgun bir algoritma + model sec
// 		output regression problem
// testi

async function Main() {
	if (!existsSync(workbench_folder)) {
		mkdirSync(workbench_folder);
	}

	await Process.Init();

	/*await Server.Init();
	const start = Date.now();

	const manHours = await SHiveQBBuilder()
		.filter(fixedIssues)
		.map(async (i) => {
			const mh = findManHour(i);
			return {
				issue: i,
				manHour: mh.manHour,
				mainManHour: mh.mainManHour,
				count: mh.count
			};
		})
		.reduceWithCache(
			async (i, acc) => {
				const mh = i.manHour;
				const days = mh / i.count;
				const lenCatName = `${Math.floor(days)}`;
				if (!acc[lenCatName]) {
					acc[lenCatName] = 0;
				}
				acc[lenCatName]++;
				return acc;
			},
			{} as Record<string, any>,
			"manHours",
			false
		);

	Server.AddData(manHours, "/manHours");

	const manHoursRate = await SHiveQBBuilder()
		.filter(fixedIssues)
		.map(async (i) => {
			const mh = findManHour(i);
			return {
				issue: i,
				manHour: mh.manHour,
				mainManHour: mh.mainManHour
			};
		})
		.reduceWithCache(
			async (i, acc) => {
				const mh = i.manHour;
				const mainMh = i.mainManHour;
				const rate = (mh / mainMh).toFixed(1);
				const lenCatName = `${rate}`;
				if (!acc[lenCatName]) {
					acc[lenCatName] = 0;
				}
				acc[lenCatName]++;
				return acc;
			},
			{} as Record<string, any>,
			"manHoursRate",
			false
		);

	Server.AddData(manHoursRate, "/manHoursRate");

	const manHoursMain = await SHiveQBBuilder()
		.filter(fixedIssues)
		.map(async (i) => {
			const mh = findManHour(i);
			return {
				issue: i,
				manHour: mh.manHour,
				mainManHour: mh.mainManHour
			};
		})
		.reduceWithCache(
			async (i, acc) => {
				const mh = i.mainManHour;
				const days = mh;
				const lenCatName = `${Math.floor(days)}`;
				if (!acc[lenCatName]) {
					acc[lenCatName] = 0;
				}
				acc[lenCatName]++;
				return acc;
			},
			{} as Record<string, any>,
			"manHoursMain",
			false
		);

	Server.AddData(manHoursMain, "/manHoursMain");

	const stemmed = await SHiveQBBuilder()
		.filter(fixedIssues)
		.map(async (i) => {
			const st = PorterStemmer.tokenizeAndStem(i.description);
			return {
				issue: i,
				st,
				bigram: ngram.bigram(st),
				trigram: ngram.trigram(st)
			};
		})
		.reduceWithCache(
			async (i, acc) => {
				for (const s of i.st) {
					if (!acc.single[s]) {
						acc.single[s] = 0;
					}
					acc.single[s]++;
				}
				for (const sArr of i.bigram) {
					const s = sArr.join(" ");
					if (!acc.bigram[s]) {
						acc.bigram[s] = 0;
					}
					acc.bigram[s]++;
				}
				for (const sArr of i.trigram) {
					const s = sArr.join(" ");
					if (!acc.trigram[s]) {
						acc.trigram[s] = 0;
					}
					acc.trigram[s]++;
				}
				return acc;
			},
			{
				single: {} as Record<string, number>,
				bigram: {} as Record<string, number>,
				trigram: {} as Record<string, number>
			},
			"stemmed",
			false
		);

	const issueStats = await SHiveQBBuilder()
		.filter(fixedIssues)
		.reduceWithCache(
			async (i, acc) => {
				acc.ct += 1;
				return acc;
			},
			{
				ct: 0
			},
			"issueStats",
			false
		);
	console.log(issueStats);

	stemmedToTuples(stemmed.single);
	stemmedToTuples(stemmed.bigram);
	stemmedToTuples(stemmed.trigram);

	//console.log(daysToResolvePerContributor);

	const end = Date.now();
	console.log(`Run time: ${((end - start) / 1000).toFixed(1)}s`);*/
}

function stemmedToTuples(dict: Record<string, number>) {
	const arr: [string, number][] = [];
	for (const key in dict) {
		if (dict[key] > 100) {
			arr.push([key, dict[key]]);
		}
	}
	arr.sort((a, b) => b[1] - a[1]);
	console.log(arr);
	return arr;
}

function groupByReeducer(field: string) {
	return async (i: any, acc: any) => {
		if (!acc[i[field]]) {
			acc[i[field]] = 0;
		}
		acc[i[field]]++;
		return acc;
	};
}

function msResolved(i: IBIssue) {
	const start = i.created;
	const resolved = i.resolutionDate!;
	const diff = resolved.getTime() - start.getTime();
	return diff;
}

function standardDeviationAndMean(values: number[]) {
	const sum = values.reduce((acc, i) => acc + i, 0);
	const mean = sum / values.length;
	const diffSum = values.reduce((acc, i) => acc + Math.pow(i - mean, 2), 0);
	const deviation = Math.sqrt(diffSum / values.length);
	return {
		sum,
		mean,
		deviation,
		count: values.length
	};
}

Main().catch(console.log);

/*
const commentChartData = await SHiveQBBuilder().reduceWithCache(
		async (i, acc) => {
			if (!acc[i.comments.length.toString()]) {
				acc[i.comments.length.toString()] = 0;
			}
			acc[i.comments.length.toString()]++;
			return acc;
		},
		{} as Record<string, number>,
		"commentCountCat"
	);
	Server.AddData(commentChartData, "/commentChartdata");

	const resolvedIssuesResolveTypes = await SHiveQBBuilder()
		.filter(async (i) => i.comments.length > 5 && !!i.resolution)
		.reduceWithCache(
			groupByReeducer("resolution"),
			{} as Record<string, any>,
			"resolvedIssuesResolveTypes5",
			true
		);
	Server.AddData(resolvedIssuesResolveTypes, "/resolvedIssuesResolveTypes");

	const fixedIssuesIssueTypes = await SHiveQBBuilder()
		.filter(fixedIssues)
		.reduceWithCache(
			groupByReeducer("issueType"),
			{} as Record<string, any>,
			"fixedIssuesIssueTypes5",
			false
		);
	Server.AddData(fixedIssuesIssueTypes, "/fixedIssuesIssueTypes");

	const fixedIssuesStatus = await SHiveQBBuilder()
		.filter(fixedIssues)
		.reduceWithCache(
			groupByReeducer("status"),
			{} as Record<string, any>,
			"fixedIssuesStatus5",
			false
		);
	Server.AddData(fixedIssuesStatus, "/fixedIssuesStatus");

	const fixedIssuesTimeEstimate = await SHiveQBBuilder()
		.filter(fixedIssues)
		.reduceWithCache(
			async (i, acc) => {
				if (i.timeEstimate || i.aggregateOriginalEstimate) {
					acc.TimeEstimate++;
				} else {
					acc.NoTimeEstimate++;
				}
				return acc;
			},
			{ TimeEstimate: 0, NoTimeEstimate: 0 } as Record<string, any>,
			"fixedIssuesTimeEstimate5",
			false
		);
	Server.AddData(fixedIssuesTimeEstimate, "/fixedIssuesTimeEstimate");

	const fixedIssuesWorklogExists = await SHiveQBBuilder()
		.filter(fixedIssues)
		.reduceWithCache(
			async (i, acc) => {
				if (i.worklog.total > 0) {
					acc.HasWorkLog++;
				} else {
					acc.NoWorkLog++;
				}
				return acc;
			},
			{ HasWorkLog: 0, NoWorkLog: 0 } as Record<string, any>,
			"fixedIssuesWorklogExists5",
			false
		);
	Server.AddData(fixedIssuesWorklogExists, "/fixedIssuesWorklogExists");

	const fixedIssuesDescCharacterLength = await SHiveQBBuilder()
		.filter(fixedIssues)
		.reduceWithCache(
			async (i, acc) => {
				if (!i.description || i.description.length == 0) {
					if (!acc["0"]) {
						acc["0"] = 0;
					}
					acc["0"]++;
					return acc;
				}
				const len = i.description.length;
				const lenCat = Math.floor(len / 100) * 100;
				const lenCatName = `${lenCat}-${lenCat + 100}`;
				if (!acc[lenCatName]) {
					acc[lenCatName] = 0;
				}
				acc[lenCatName]++;
				return acc;
			},
			{} as Record<string, any>,
			"fixedIssuesDescCharacterLength5",
			false
		);
	Server.AddData(
		fixedIssuesDescCharacterLength,
		"/fixedIssuesDescCharacterLength"
	);

	const fixedIssuesPriority = await SHiveQBBuilder()
		.filter(fixedIssues)
		.reduceWithCache(
			groupByReeducer("priority"),
			{} as Record<string, any>,
			"fixedIssuesPriority5",
			false
		);
	Server.AddData(fixedIssuesPriority, "/fixedIssuesPriority");

	const fixedIssuesReviewerExists = await SHiveQBBuilder()
		.filter(fixedIssues)
		.reduceWithCache(
			async (i, acc) => {
				if (i.reviewer || i.reviewers.length > 0) {
					acc.HasReviewer++;
				} else {
					acc.NoReviewer++;
				}
				return acc;
			},
			{ HasReviewer: 0, NoReviewer: 0 } as Record<string, any>,
			"fixedIssuesReviewerExists5",
			false
		);
	Server.AddData(fixedIssuesReviewerExists, "/fixedIssuesReviewerExists");

	const fixedIssuesDaysToResolve = await SHiveQBBuilder()
		.filter(fixedIssues)
		.reduceWithCache(
			async (i, acc) => {
				const start = i.created;
				const resolved = i.resolutionDate!;
				const diff = resolved.getTime() - start.getTime();
				const days = diff / 1000 / 60 / 60 / 24;
				const lenCatName = `${Math.floor(days)}`;
				if (!acc[lenCatName]) {
					acc[lenCatName] = 0;
				}
				acc[lenCatName]++;
				return acc;
			},
			{} as Record<string, any>,
			"fixedIssuesDaysToResolve5",
			false
		);
	Server.AddData(fixedIssuesDaysToResolve, "/fixedIssuesDaysToResolve");



*/
