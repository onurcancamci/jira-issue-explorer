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
import { IBIssue } from "./IssueUtil";
import { QB, FileIssueReader, HiveQBBuilder, SHiveQBBuilder } from "./QB";
import { Server } from "./Server";

export const issue_folder = process.env.ISSUES || "../jira/issues";
export const workbench_folder = "./workbench";

async function Main() {
	if (!existsSync(workbench_folder)) {
		mkdirSync(workbench_folder);
	}
	await Server.Init();
	const start = Date.now();

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

	console.log(fixedIssuesReviewerExists);

	const end = Date.now();
	console.log(`Run time: ${((end - start) / 1000).toFixed(1)}s`);
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

async function fixedIssues(i: any) {
	return i.comments.length > 5 && !!i.resolution && i.resolution == "Fixed";
}

Main().catch(console.log);
