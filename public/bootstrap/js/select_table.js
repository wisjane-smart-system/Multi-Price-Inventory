$(document).ready(function () {
    // all custom jQuery will go here
    $("tbody tr").click(function () {
    var product = $('.product_name',this).html();
    var quantity =$('.quantity',this).html();
	var cost =$('.total_cost',this).html();
    
    document.getElementById('kalla').innerHTML = product;
	// alert(product +','+ quantity+','+ cost);
    // console.log(product + ' ' + quantity + ' ' + cost )
    });

    
});