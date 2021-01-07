import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	writeFileSync
} from "fs";
import { join } from "path";
import { QB, FileIssueReader } from "./QB";

export const issue_folder = process.env.ISSUES || "../jira/issues";
export const workbench_folder = "./workbench";

async function categorize1(qb: QB) {
	const result = await qb
		.map(async (i) => {
			return {
				key: i.key,
				status: i.fields.status.name,
				type: i.fields.issuetype.name,
				project: i.fields.project.key
			};
		})
		.reduce(async (i, acc) => {
			if (!acc[i.project]) {
				acc[i.project] = 0;
			}
			acc[i.project]++;

			return acc;
		}, {} as Record<string, number>);
	return result;
}

async function find11(qb: QB) {
	return qb.find(async (i) => !!i.fields.customfield_12313825);
}

async function Main() {
	if (!existsSync(workbench_folder)) {
		mkdirSync(workbench_folder);
	}

	const start = Date.now();

	const reader = new FileIssueReader(issue_folder, (s) => {
		return true;
	});
	const qb = new QB(reader);

	//const result = await categorize1(qb);
	//const result = await find11(qb);

	//console.log(result?.fields.customfield_12311120);

	const s = qb
		.filter(async (i) => !!i.fields.customfield_12314121)
		.map(async (i) => i.fields.customfield_12314121);
	//.reduce(async (c, s) => {
	//	s.add(c.value);
	//	return s;
	//}, new Set());

	//console.log(s);
	const arr = [];
	for await (const est of qb) {
		arr.push(est);
	}
	writeFileSync("./est.json", JSON.stringify(arr));
	for (let k = 0; k < 100; k++) {
		//console.log(await qb.next());
	}

	const end = Date.now();

	console.log(`Run time: ${((end - start) / 1000).toFixed(1)}s`);
}

Main().catch(console.log);

export interface IIssue {
	expand: string; //"renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations";
	id: string; //"12962708";
	self: string; //"https://issues.apache.org/jira/rest/api/2/issue/12962708";
	key: string; //"AAR-1";
	fields: {
		fixVersions: []; //?
		resolution: null; //?
		//customfield_12312322: null; //git notification mailing list
		//customfield_12312323: null; // github integration
		//customfield_12312320: null; // git repo name
		//customfield_12310420: string | null;// global rank //"9223372036854775807";
		//customfield_12312321: null; // git repo type
		//customfield_12312328: null; // blog admin
		//customfield_12312329: null; // blog admin
		//customfield_12312326: null; // blog username
		//customfield_12310300: null; // release version history
		//customfield_12312327: null; // blog email
		//customfield_12312324: null; // git repo import path
		customfield_12312720: null | string; // docs text
		//customfield_12312325: null | string; // new tlp name
		lastViewed: null | string; // date time string
		priority: {
			self: string; //"https://issues.apache.org/jira/rest/api/2/priority/3";
			iconUrl: string; //"https://issues.apache.org/jira/images/icons/priorities/major.svg";
			name:
				| "Blocker"
				| "Critical"
				| "High"
				| "Low"
				| "Major"
				| "Minor"
				| "Normal"
				| "P0"
				| "P1"
				| "P2"
				| "P3"
				| "P4"
				| "Trivial"
				| "Urgent"; //"Major";
			id: string; //"3";
		};
		labels: string[];
		//customfield_12312333: null; // new blog write access
		//customfield_12312334: null; // existing blog name
		customfield_12313422: "false" | "true"; // enable automatic patch review
		customfield_12310310: string; // "0.0" attachment count
		//customfield_12312331: null | string; // new blog PMC
		//customfield_12312332: null | string; // new blog admin
		aggregatetimeoriginalestimate: null | number; // Σ Original Estimate
		timeestimate: null | number; // Remaining estimate
		//customfield_12312330: null; // blog write access
		versions: any[];
		customfield_12311120: null | string; // epic link // issue key
		customfield_12313826: null; // change category
		//customfield_12312339: null | string; // bugzilla list of usernames
		issuelinks: []; // TODO: type?
		customfield_12313825: {
			self: string; //"https://issues.apache.org/jira/rest/api/2/customFieldOption/12982";
			value: string; //"Correctness";
			id: string; //"12982";
		}; // bug category
		assignee: null | IUser;
		//customfield_12312337: null | string; // bugzilla pmc name
		customfield_12313823: null | string; // test and documentation plan
		//customfield_12312338: null | string; // bugzilla email notification address
		//customfield_12313822: any; // Discovered by
		//customfield_12311920: null | any; // issueFunction
		//customfield_12312335: null; // blogs existing access level
		customfield_12313821: {
			self: string; //'https://issues.apache.org/jira/rest/api/2/customFieldOption/12965',
			value: "Low Hanging Fruit" | "Normal" | "Challenging"; //'Normal',
			id: string; //'12965'
		}; // complexity
		//customfield_12312336: null | string; // bugzilla project name
		customfield_12313820: null | any; // severity
		status: {
			self: string; //"https://issues.apache.org/jira/rest/api/2/status/1";
			description: string; //"The issue is open and ready for the assignee to start work on it.";
			iconUrl: string; //"https://issues.apache.org/jira/images/icons/statuses/open.png";
			name:
				| "Open"
				| "In Progress"
				| "Reopened"
				| "Resolved"
				| "Closed"
				| "Blocked"
				| "Continued"
				| "Patch Available"
				| "Patch Reviewed"
				| "Reviewable"
				| "Documentation Required"
				| "Testcases Required"
				| "Documentation/Testcases Required"
				| "Waiting for user"
				| "Waiting for Infra"
				| "Testing"
				| "Unknown"
				| "Requires Porting"
				| "Not Applicable"
				| "Ported"
				| "Done"
				| "In Review"
				| "To Do"
				| "Accepted"
				| "Ready to Commit"
				| "Awaiting Feedback"
				| "New Issue"
				| "Fixed"
				| "Invalid"
				| "FixedInBranch"
				| "Duplicate"
				| "Verified"
				| "WontFix"
				| "UnderReview"
				| "Started"
				| "For Review"
				| "Idea"
				| "Abandoned"
				| "Under Discussion"
				| "Completed"
				| "In Implementation"
				| "on Hold"
				| "Triage Needed"
				| "Review In Progress"
				| "Changes Suggested"
				| "Requires Testing"
				| "Draft"
				| "Voting"
				| "Passed"
				| "Failed"
				| "Pending"
				| "Yes"
				| "No"
				| "Abstain";
			id: string; //"1";
			statusCategory: {
				self: string; //"https://issues.apache.org/jira/rest/api/2/statuscategory/2";
				id: number; //2;
				key: string; //"new";
				colorName: string; //"blue-gray";
				name: "To Do" | "No Category" | "In Progress" | "Done";
			};
		};
		components: [];
		//customfield_12312026: null;
		//customfield_12312023: null;
		//customfield_12312024: null;
		aggregatetimeestimate: null;
		//customfield_12312022: null;
		customfield_12310921: null | string[]; // sprint
		//customfield_12310920: string; // rank obsolete //"9223372036854775807";
		//customfield_12312823: null;
		creator: IUser;
		subtasks: []; // TODO: type?
		reporter: IUser;
		aggregateprogress: { progress: number; total: number };
		//customfield_12313520: null; // review patch
		customfield_12310250: null; // flags
		progress: { progress: number; total: number };
		//customfield_12313924: null;
		votes: {
			self: string; //"https://issues.apache.org/jira/rest/api/2/issue/AAR-1/votes";
			votes: number;
			hasVoted: boolean;
		};
		worklog: {
			startAt: number; //0
			maxResults: number; //20
			total: number; //0;
			worklogs: []; // TODO: type?
		};
		customfield_12313920: null | IUser[]; // authors
		issuetype: {
			self: string; //"https://issues.apache.org/jira/rest/api/2/issuetype/1";
			id: string; //"1";
			description: string; //"A problem which impairs or prevents the functions of the product.";
			iconUrl: string; //"https://issues.apache.org/jira/secure/viewavatar?size=xsmall&avatarId=21133&avatarType=issuetype";
			name:
				| "Bug"
				| "New Feature"
				| "Improvement"
				| "Test"
				| "Wish"
				| "Task"
				| "Sub-task"
				| "New JIRA Project"
				| "RTC"
				| "TCK Challenge"
				| "Question"
				| "Temp"
				| "Brainstorming"
				| "Umbrella"
				| "Epic"
				| "Story"
				| "Technical Task"
				| "Dependency upgrade"
				| "Suitable Name Search"
				| "Documentation or Website"
				| "Planned Work"
				| "New Confluence Wiki"
				| "New Git Repo"
				| "Github Integration"
				| "New TLP "
				| "New TLP - Common Tasks"
				| "SVN->GIT Migration"
				| "Blog - New Blog Request"
				| "Blogs - New Blog User Account Request"
				| "Blogs - Access to Existing Blog"
				| "New Bugzilla Project"
				| "SVN->GIT Mirroring"
				| "IT Help"
				| "Access"
				| "Request"
				| "Project"
				| "Proposal"
				| "GitBox Request"
				| "Dependency"
				| "Requirement"
				| "Comment"
				| "Choose from below ..."
				| "Outage"
				| "Office Hours"
				| "Pending Review"
				| "Board Vote"
				| "Director Vote";
			subtask: boolean;
			avatarId: number; //21133;
		};
		timespent: null | number;
		customfield_12314020: any; // development // large json data TODO: add
		customfield_12314141: null | IUser[]; // reviewers
		//customfield_12314140: null; // ignite flags
		project: IProject;
		aggregatetimespent: null;
		customfield_12310220: null | string; // date of first response
		//customfield_12312520: null;
		//customfield_12312521: string; //"2016-04-26 19:11:19.439"; // last public comment
		customfield_12310222: null | string; // time in status
		customfield_12314146: null; // skill level // TODO: type
		//customfield_12314145: null;
		//customfield_12314144: null;
		//customfield_12314143: null;
		resolutiondate: null;
		workratio: number; //-1;
		//customfield_12312923: null;
		//customfield_12312920: null;
		//customfield_12312921: null;
		watches: {
			self: string; //"https://issues.apache.org/jira/rest/api/2/issue/AAR-1/watchers";
			watchCount: number; //1;
			isWatching: boolean;
		};
		created: string; //"2016-04-26T19:11:19.439+0000";
		updated: string; //"2016-04-26T19:11:19.439+0000";
		timeoriginalestimate: null;
		description: string;
		//customfield_10010: null;
		timetracking: {}; // TODO: type
		customfield_12314127: null; // level of effort
		//customfield_12314126: null;
		customfield_12314125: null; // bug behaviour facts?
		//customfield_12314124: null; // lucene fields
		attachment: [];
		//customfield_12312340: null;
		//customfield_12314123: null; // workaround
		//customfield_12312341: null;
		customfield_12312220: null | any; // testcase included
		//customfield_12314122: null;
		customfield_12314121: null; // estimated complexity
		//customfield_12314120: null;
		//customfield_12314129: null; // review date
		//customfield_12314128: null;
		summary: string;
		//customfield_12314130: null;
		customfield_12310291: null | string[]; // epic theme
		//customfield_12310290: null; // flagged
		//customfield_12314138: null;
		customfield_12314137: null | string; // tags
		environment: null | string;
		//customfield_12314136: null;
		customfield_12314135: null | IUser; // reviewer
		//customfield_12311020: null;
		//customfield_12314134: null;
		duedate: null | string; // date
		customfield_12314132: null | any; // issue and fix info TODO: type
		//customfield_12314131: null;
		comment: {
			comments: IComment[];
			maxResults: 0;
			total: 0;
			startAt: 0;
		};
		//customfield_12311820: string; //"0|i2wrqf:";
		customfield_12314139: null | IUser; // tester
	};
	properties: {};
}

export interface IComment {
	self: string; //'https://issues.apache.org/jira/rest/api/2/issue/12963426/comment/15261824',
	id: string; //'15261824',
	author: IUser;
	body: string; //'faqegggf',
	updateAuthor: IUser;
	created: string; //'2016-04-28T09:16:51.183+0000',
	updated: string; //'2016-04-28T09:16:51.183+0000'
}

export interface IUser {
	self: string; //"https://issues.apache.org/jira/rest/api/2/user?username=";
	name: string; //"";
	key: string; //"";
	avatarUrls: {
		"48x48": string; //"https://issues.apache.org/jira/secure/useravatar?avatarId=10452";
		"24x24": string; //"https://issues.apache.org/jira/secure/useravatar?size=small&avatarId=10452";
		"16x16": string; //"https://issues.apache.org/jira/secure/useravatar?size=xsmall&avatarId=10452";
		"32x32": string; //"https://issues.apache.org/jira/secure/useravatar?size=medium&avatarId=10452";
	};
	displayName: string; //"";
	active: boolean;
	timeZone: string; //"Etc/UTC";
}

export interface IProject {
	self: string; //"https://issues.apache.org/jira/rest/api/2/project/12320120";
	id: string; //"12320120";
	key: string; //"AAR";
	name: string; //"aardvark";
	projectTypeKey: "software";
	avatarUrls: {
		"48x48": string; //"https://issues.apache.org/jira/secure/projectavatar?pid=12320120&avatarId=10011";
		"24x24": string; //"https://issues.apache.org/jira/secure/projectavatar?size=small&pid=12320120&avatarId=10011";
		"16x16": string; //"https://issues.apache.org/jira/secure/projectavatar?size=xsmall&pid=12320120&avatarId=10011";
		"32x32": string; //"https://issues.apache.org/jira/secure/projectavatar?size=medium&pid=12320120&avatarId=10011";
	};
}
