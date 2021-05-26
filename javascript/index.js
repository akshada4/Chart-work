let fetchData = () => {
	fetch('productdata/data.json')
	.then(response =>  response.json())
	.then(res => plotData(res));
}

let plotData = (dataOfProducts) => {
	d3.select('body')
	.data(dataOfProducts)
	.enter().append('p')
	.text(d => {
		return d.Date;
	});
	// console.log(dataOfProducts);
}

fetchData();