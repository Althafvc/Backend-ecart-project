const errorArea = document.getElementById('error_area')
document.getElementById('submitBtn').addEventListener('click', async (event) => {
    event.preventDefault()
    const errorArea = document.getElementById('error_area')
    const stock = document.getElementById('stock').value.trim()
    const productname = document.getElementById('productname').value.trim()
    const image = document.querySelector('.input_file').value.trim()
    const subcategory = document.getElementById('subcategory').value
    const category = document.getElementById('category').value
    const description = document.getElementById('text_area').value.trim()
    const price = document.getElementById('price').value


    try {

            if (!stock) {
                errorArea.innerHTML = 'Stock field is mandatory'
                errorArea.classList.add('red')
                return
            } else {
                errorArea.innerHTML = ''
                errorArea.classList.remove('red')
            }
            
            if(!productname) {
                errorArea.innerHTML = 'Productname is mandatory'
                errorArea.classList.add('red')
                return
            }else {
                errorArea.innerHTML = ''
                errorArea.classList.remove('red')
            }
            
            if(!image) {
                errorArea.innerHTML = 'images are mandatory'
                errorArea.classList.add('red')
                return
            } else {
                errorArea.innerHTML = ''
                errorArea.classList.remove('red')
            }
            
            if (!subcategory) {
                errorArea.innerHTML = 'please provide a subcategory'
                errorArea.classList.add('red')
                return
            }else {
                errorArea.innerHTML = 'jayichu'
                errorArea.classList.remove('red')
            }
            
            if(!category) {
                errorArea.innerHTML = 'please provide a valid category'
                errorArea.classList.add('red')
                return
            }else {
                errorArea.innerHTML = ''
                errorArea.classList.remove('red')
            }
            
            if(!description) {
                    errorArea.innerHTML = 'please add your description'
                    errorArea.classList.add('red')
                    return
                }else {
                errorArea.innerHTML = ''
                errorArea.classList.remove('red')
            }

            if(!price) {
                errorArea.innerHTML = 'price field is mandatory'
                    errorArea.classList.add('red')
                    return
            }else {
                errorArea.innerHTML = ''
                errorArea.classList.remove('red')
            }
        } 

    catch (err) { console.log('error in axios', err) }

    
    const formData = new FormData(document.getElementById('formID'))
    
    const response = await axios.post('/admin/addproduct', formData)
    const result = response.data
    
})