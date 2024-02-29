async function addTowish(event, productId) {
    event.preventDefault()
    const icon = document.querySelector('.icon' + productId)
    console.log('icon', icon);
    console.log('productId', productId);





    try {

        const response = await axios.get(`/user/addtowishlist?productid=${productId}`)
        const result = response.data
        if (result.success) {

            if (icon.classList.contains('bi-heart')) {
                icon.classList.replace('bi-heart', 'bi-heart-fill')
                icon.style.color = 'red'
    
            } else {
                icon.classList.replace('bi-heart-fill', 'bi-heart'),
                icon.style.color = ''
            }
         
        }
    } catch (err) {
        console.log('error while adding to wishlist', err);
    }
}