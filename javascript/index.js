let fetchData = () => {
	fetch('productdata/data.json')
		.then(response =>  response.json())
		.then(data => storeData(data));
}

let plotData = (dataOfProducts, reportingDate) => {
	let products = {};
	let maxHeight = 0;
	for (let product in dataOfProducts){
		const productData = dataOfProducts[product];
		let nameOfProduct = product.replace(/\s/g ,'').toLowerCase();
		let height = [productData[0].numberOfBugs];
		let date = [productData[0].date];
		for (let i = 1; i < productData.length; i++) {
			if (productData[i].date === productData[i-1].date) {
				height[height.length-1] += productData[i].numberOfBugs;
			}
			else {
				height.push(productData[i].numberOfBugs);
				date.push(productData[i].date);
			}
			maxHeight = Math.max(height[(height.length)-1],maxHeight);
		}
		products[nameOfProduct] = {date:date ,height: height};
		maxHeight = Math.max(height[(height.length)-1],maxHeight);

	}
	for (let dataKey in products){		
		for (let i = 0; i<reportingDate.length; i++){
			if (!products[dataKey].date.includes(reportingDate[i]))
				products[dataKey].height.splice(i,0,0);
		}
		createBarGraph(products[dataKey].height,reportingDate,dataKey,maxHeight);
	}
}	

let createBarGraph = (barHeight,reportingDate, svgId, maxHeight) => {
	let margin = {top:25,
		right: 10, 
		bottom: 25,
		left: 10};

	let heightSvg = 500;
	let widthSvg = 500;
	let yScale = d3.scaleLinear()
		.domain([0,maxHeight])
		.range([0,heightSvg - (margin.top + margin.bottom)]);

	let xScale = d3.scaleBand()
		.domain(reportingDate)
		.range([margin.left+margin.right ,widthSvg - (margin.left + margin.right)])
		.padding(0.2);

	let vScale = d3.scaleLinear()
		.domain([0, maxHeight])
		.range([heightSvg - margin.bottom,0]);

	let uScale = d3.scaleBand()
		.domain(reportingDate)
		.range([margin.left+margin.right ,widthSvg - margin.right]);

	let yAxis = d3.axisLeft(vScale)
	.ticks(10);

	let xAxis = d3.axisBottom(uScale);

	const svg = d3.select('#chart').append('svg')
	.attr('height', heightSvg)
	.attr('width',widthSvg)
	.attr('id', svgId);

	svg.selectAll('rect')
		.data(barHeight)
		.enter().append('rect')
		.style('fill','black')
		.attr('width', xScale.bandwidth())
		.attr('height', height => {
			return yScale(height);
		})
		.attr('x',(h,i) => {
			return xScale(reportingDate[i]);
		})
		.attr('y', height => {
			return heightSvg - yScale(height) - margin.bottom;
		});

	svg.append('g')
	.attr('transform',`translate(${1.25*(margin.left+margin.right)}, 0)`)
	.call(yAxis);
	svg.append('g')
	.attr('transform',`translate(${margin.left-5},${heightSvg - margin.bottom})`)
	.call(xAxis);


}

let storeData = (data) => {
	let dataExtracted = {};
	let dateOfReport = new Set();
	for (let dataKey in data) {
		const productName = data[dataKey]['Product Name'];
		const date = data[dataKey].Date;
		const numberOfBugs = data[dataKey]['Number Of Bugs'];
		dateOfReport.add(date);
		if (productName in dataExtracted) 
			dataExtracted[productName].push({date: date,
				numberOfBugs: numberOfBugs});
		else
			dataExtracted[productName] = [{date: date,
				numberOfBugs: numberOfBugs}];
	}
	reportingDate = [];
	dateOfReport.forEach(d => reportingDate.push(d));
	plotData(dataExtracted,reportingDate);
}


let func = async () => {
	await fetchData();
	let button = document.getElementsByClassName('btn');
	for (let i = 0; i<button.length ; i++){
		button[i].addEventListener('mouseover', () => {
		let idOfSvg = button[i].innerHTML.replace(/\s/g,'').toLowerCase();
		document.getElementById(idOfSvg).style.opacity = 1;
	});
	button[i].addEventListener('mouseout', () => {
		let idOfSvg = button[i].innerHTML.replace(/\s/g,'').toLowerCase();
		document.getElementById(idOfSvg ).style.opacity = 0;
	});
	}	
}

func();