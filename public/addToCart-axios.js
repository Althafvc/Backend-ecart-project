   
   async function addToCart(event, productId){
        event.stopPropagation()
        let  response = await fetch(`/user/add_to_cart?id=${productId}`,{
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
