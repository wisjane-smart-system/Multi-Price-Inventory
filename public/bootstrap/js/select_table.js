$(document).ready(function () {
    // all custom jQuery will go here
    $("tbody tr").click(function () {
    var product = $('.product_name',this).html();
    var quantity =$('.quantity',this).html();
	var cost =$('.total_cost',this).html();
	
	// alert(product +','+ quantity+','+ cost);
	console.log(product + ' ' + quantity + ' ' + cost )
    });
});