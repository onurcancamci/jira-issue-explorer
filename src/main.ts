import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	writeFileSync
} from "fs";
import { join } from "path";
import { QB } from "./QB";

export const issue_folder = process.env.ISSUES || "../jira/issues";
export const workbench_folder = "./workbench";

async function Main() {
	if (!existsSync(workbench_folder)) {
		mkdirSync(workbench_folder);
	}

	const qb = new QB();
	await qb.test();
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
		customfield_12312322: null;
		customfield_12312323: null;
		customfield_12312320: null;
		customfield_12310420: string | null; //"9223372036854775807";
		customfield_12312321: null;
		customfield_12312328: null;
		customfield_12312329: null;
		customfield_12312326: null;
		customfield_12310300: null;
		customfield_12312327: null;
		customfield_12312324: null;
		customfield_12312720: null;
		customfield_12312325: null;
		lastViewed: any; //?
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
		customfield_12312333: null;
		customfield_12312334: null;
		customfield_12313422: "false" | "true"; //?
		customfield_12310310: string; // "0.0"
		customfield_12312331: null;
		customfield_12312332: null;
		aggregatetimeoriginalestimate: null;
		timeestimate: null;
		customfield_12312330: null;
		versions: [];
		customfield_12311120: null;
		customfield_12313826: null;
		customfield_12312339: null;
		issuelinks: [];
		customfield_12313825: null;
		assignee: null;
		customfield_12312337: null;
		customfield_12313823: null;
		customfield_12312338: null;
		customfield_12313822: null;
		customfield_12311920: null;
		customfield_12312335: null;
		customfield_12313821: null;
		customfield_12312336: null;
		customfield_12313820: null;
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
		customfield_12312026: null;
		customfield_12312023: null;
		customfield_12312024: null;
		aggregatetimeestimate: null;
		customfield_12312022: null;
		customfield_12310921: null;
		customfield_12310920: string; //"9223372036854775807";
		customfield_12312823: null;
		creator: IUser;
		subtasks: []; //?
		reporter: IUser;
		aggregateprogress: { progress: number; total: number };
		customfield_12313520: null;
		customfield_12310250: null;
		progress: { progress: number; total: number };
		customfield_12313924: null;
		votes: {
			self: string; //"https://issues.apache.org/jira/rest/api/2/issue/AAR-1/votes";
			votes: number;
			hasVoted: boolean;
		};
		worklog: {
			startAt: number; //0
			maxResults: number; //20
			total: number; //0;
			worklogs: []; //?
		};
		customfield_12313920: null;
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
		timespent: null; //?
		customfield_12314020: any; // large json data TODO: add
		customfield_12314141: null;
		customfield_12314140: null;
		project: IProject;
		aggregatetimespent: null;
		customfield_12310220: null;
		customfield_12312520: null;
		customfield_12312521: string; //"2016-04-26 19:11:19.439";
		customfield_12310222: null;
		customfield_12314146: null;
		customfield_12314145: null;
		customfield_12314144: null;
		customfield_12314143: null;
		resolutiondate: null;
		workratio: number; //-1;
		customfield_12312923: null;
		customfield_12312920: null;
		customfield_12312921: null;
		watches: {
			self: string; //"https://issues.apache.org/jira/rest/api/2/issue/AAR-1/watchers";
			watchCount: number; //1;
			isWatching: boolean;
		};
		created: string; //"2016-04-26T19:11:19.439+0000";
		updated: string; //"2016-04-26T19:11:19.439+0000";
		timeoriginalestimate: null;
		description: string;
		customfield_10010: null;
		timetracking: {}; // ?
		customfield_12314127: null;
		customfield_12314126: null;
		customfield_12314125: null;
		customfield_12314124: null;
		attachment: [];
		customfield_12312340: null;
		customfield_12314123: null;
		customfield_12312341: null;
		customfield_12312220: null;
		customfield_12314122: null;
		customfield_12314121: null;
		customfield_12314120: null;
		customfield_12314129: null;
		customfield_12314128: null;
		summary: string;
		customfield_12314130: null;
		customfield_12310291: null;
		customfield_12310290: null;
		customfield_12314138: null;
		customfield_12314137: null;
		environment: null;
		customfield_12314136: null;
		customfield_12314135: null;
		customfield_12311020: null;
		customfield_12314134: null;
		duedate: null;
		customfield_12314132: null;
		customfield_12314131: null;
		comment: {
			comments: [];
			maxResults: 0;
			total: 0;
			startAt: 0;
		};
		customfield_12311820: string; //"0|i2wrqf:";
		customfield_12314139: null;
	};
	properties: {};
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
