   let size;
   let color; 
   const sizeArea = document.querySelectorAll('.label_size')
   const colorArea = document.querySelectorAll('.label_span_color')
   
   
    function selectSize(event,productSize){
        size = productSize
    }
   
    function selectColor(event,productColor){
        color = productColor

    }
   
   async function addToCart(event, productId){
        event.stopPropagation()

        if(document.getElementById('cartBtn').innerText == "ADD TO CART") {

        if (sizeArea && sizeArea.length > 0 && !size || colorArea && colorArea.length > 0 && !color) {
            alert('Please select appropriate size and color');
        } else {
            let  response = await fetch(`/user/add_to_cart?id=${productId}&size=${size}&color=${color}`,{
                method:'GET',
                headers:{
                  'Content-Type':'application/json'
                },
            })         
            const result = await response.json()
            
            if (!result.success) {
                window.location.href='/login'
            }else {
                if(result.exist){
                    window.location.href='/user/cart'
                }
                else if(result.added){
                    document.getElementById('cartBtn').innerHTML = "GO TO CART"
    
                }
                else if(result.newCart){
                    document.getElementById('cartBtn').innerHTML = "GO TO CART"
                }
            }
        }
    }else{
        window.location.href='/user/cart'
    }



        

       
}
