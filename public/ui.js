async function main() {
	await commentChartDataGen();
	await commentChartDataGenAll();
	await resolvedIssuesResolveTypes();
	await fixedIssuesIssueTypes();
	await fixedIssuesStatus();
	await fixedIssuesTimeEstimate();
	await fixedIssuesWorklogExists();
	await fixedIssuesDescCharacterLength();
	await fixedIssuesPriority();
	await fixedIssuesReviewerExists();
	await fixedIssuesDaysToResolve();
}

async function fixedIssuesDescCharacterLength() {
	const cats = await req("/fixedIssuesDescCharacterLength");
	for (const key in cats) {
		if (cats[key] <= 10) {
			delete cats[key];
		}
	}
	const labels = Object.keys(cats);
	const datas = labels.map((l) => {
		return {
			label: l,
			value: cats[l]
		};
	});
	const datasSorted = datas.sort((a, b) => {
		const al = parseInt(a.label.split("-")[0]);
		const bl = parseInt(b.label.split("-")[0]);
		if (al < bl) {
			return -1;
		}
		if (al > bl) {
			return 1;
		}
		return 0;
	});
	const labelsn = datasSorted.map((d) => d.label);
	const datan = datasSorted.map((d) => d.value);
	await barChartGen(
		labelsn,
		datan,
		"Fixed Issues Categorized By Character Length of Description and Comment Count > 5"
	);
}

async function fixedIssuesReviewerExists() {
	const cats = await req("/fixedIssuesReviewerExists");
	const labels = Object.keys(cats);
	const data = labels.map((l) => cats[l]);
	await barChartGen(
		labels,
		data,
		"Fixed Issues Categorized By Existance of Reviewer and Comment Count > 5"
	);
}

async function fixedIssuesDaysToResolve() {
	const cats = await req("/fixedIssuesDaysToResolve");
	for (const key in cats) {
		if (cats[key] <= 10) {
			delete cats[key];
		}
	}
	const labels = Object.keys(cats);
	const data = labels.map((l) => cats[l]);
	await barChartGen(
		labels,
		data,
		"Fixed Issues Categorized By Days to Resolve Issue and Comment Count > 5"
	);
}

async function fixedIssuesPriority() {
	const cats = await req("/fixedIssuesPriority");
	const labels = Object.keys(cats);
	const data = labels.map((l) => cats[l]);
	await barChartGen(
		labels,
		data,
		"Fixed Issues Categorized By Priority and Comment Count > 5"
	);
}

async function fixedIssuesWorklogExists() {
	const cats = await req("/fixedIssuesWorklogExists");
	const labels = Object.keys(cats);
	const data = labels.map((l) => cats[l]);
	await barChartGen(
		labels,
		data,
		"Fixed Issues Categorized By Work Log and Comment Count > 5"
	);
}

async function fixedIssuesTimeEstimate() {
	const cats = await req("/fixedIssuesTimeEstimate");
	const labels = Object.keys(cats);
	const data = labels.map((l) => cats[l]);
	await barChartGen(
		labels,
		data,
		"Fixed Issues Categorized By Time Estimates and Comment Count > 5"
	);
}

async function fixedIssuesStatus() {
	const cats = await req("/fixedIssuesStatus");
	const labels = Object.keys(cats);
	const data = labels.map((l) => cats[l]);
	await barChartGen(
		labels,
		data,
		"Fixed Issues Categorized By Status and Comment Count > 5"
	);
}

async function fixedIssuesIssueTypes() {
	const cats = await req("/fixedIssuesIssueTypes");
	const labels = Object.keys(cats);
	const data = labels.map((l) => cats[l]);
	await barChartGen(
		labels,
		data,
		"Fixed Issues Categorized By Issue Type and Comment Count > 5"
	);
}

async function resolvedIssuesResolveTypes() {
	const cats = await req("/resolvedIssuesResolveTypes");
	const labels = Object.keys(cats);
	const data = labels.map((l) => cats[l]);
	await barChartGen(
		labels,
		data,
		"Resolved Issues Categorized By Resolution Type and Comment Count > 5"
	);
}

async function commentChartDataGenAll() {
	const cats = await req("/commentChartData");
	const datas = [];
	const max = Object.keys(cats)
		.map((c) => parseInt(c))
		.reduce((max, e) => Math.max(max, e), -1);
	for (let k = 0; k <= max; k++) {
		datas.push({
			label: k.toString(),
			value: cats[k] || 0
		});
	}

	const labels = datas.map((d) => d.label);
	const data = datas.map((d) => d.value);

	barChartGen(labels, data, "Issue Count Per Comment Count");
}

async function commentChartDataGen() {
	const cats = await req("/commentChartData");
	const datas = [];
	for (let k = 0; k <= 10; k++) {
		datas.push({
			label: k.toString(),
			value: cats[k]
		});
	}
	datas.push({
		label: "11-20",
		value: range(11, 21).reduce((acc, k) => acc + cats[k], 0)
	});
	datas.push({
		label: "21-50",
		value: range(21, 51).reduce((acc, k) => acc + (cats[k] || 0), 0)
	});
	datas.push({
		label: "51-100",
		value: range(51, 101).reduce((acc, k) => acc + (cats[k] || 0), 0)
	});
	datas.push({
		label: "101+",
		value: range(
			101,
			Object.keys(cats)
				.map((c) => parseInt(c))
				.reduce((max, e) => Math.max(max, e), -1) + 1
		).reduce((acc, k) => acc + (cats[k] || 0), 0)
	});

	const labels = datas.map((d) => d.label);
	const data = datas.map((d) => d.value);

	barChartGen(labels, data, "Issue Count Per Comment Count");
}

function barChartGen(labels, data, name) {
	const canvas = document.createElement("canvas");
	canvas.id = Math.random().toString().replace(/\./g, "");
	document.body.appendChild(canvas);
	const ctx = canvas.getContext("2d");

	const chart = new Chart(ctx, barChartDataGen(labels, data, name));
	return chart;
}

function barChartDataGen(labels, data, name, color = "blue") {
	return {
		type: "bar",
		data: {
			labels: labels,
			datasets: [
				{
					label: name,
					data: data,
					backgroundColor: labels.map((l) => colors[color].fg),
					borderColor: labels.map((l) => colors[color].border),
					borderWidth: 1
				}
			]
		},
		options: {
			scales: {
				yAxes: [
					{
						ticks: {
							beginAtZero: true
						}
					}
				]
			}
		}
	};
}

async function req(path, data) {
	const method = data ? "POST" : "GET";
	const res = await fetch(`http://localhost:5000${path}`, {
		method,
		headers: {
			"Content-Type": "application/json"
		},
		body: data ? JSON.stringify(data) : undefined
	}).then((r) => r.json());
	return res;
}

function range(s, e, inc = 1) {
	const arr = [];
	for (let k = s; k < e; k += inc) {
		arr.push(k);
	}
	return arr;
}

const colors = {
	red: {
		name: "red",
		fg: "rgba(255, 99, 132, 0.2)",
		border: "rgba(255, 99, 132, 1)"
	},
	blue: {
		name: "blue",
		fg: "rgba(54, 162, 235, 0.2)",
		border: "rgba(54, 162, 235, 1)"
	},
	yellow: {
		name: "yellow",
		fg: "rgba(255, 206, 86, 0.2)",
		border: "rgba(255, 206, 86, 1)"
	},
	green: {
		name: "green",
		fg: "rgba(75, 192, 192, 0.2)",
		border: "rgba(75, 192, 192, 1)"
	},
	purple: {
		name: "purple",
		fg: "rgba(153, 102, 255, 0.2)",
		border: "rgba(153, 102, 255, 1)"
	},
	orange: {
		name: "orange",
		fg: "rgba(255, 159, 64, 0.2)",
		border: "rgba(255, 159, 64, 1)"
	}
};

main().catch(console.log);
