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
                console.log(1);
                errorArea.innerHTML = 'Stock field is mandatory'
                errorArea.classList.add('red')
                return
            } else {
                console.log(2);
                errorArea.innerHTML = ''
                errorArea.classList.remove('red')
            }
            
            if(!productname) {
                console.log(3);
                errorArea.innerHTML = 'Productname is mandatory'
                errorArea.classList.add('red')
                return
            }else {
                console.log(4);
                errorArea.innerHTML = ''
                errorArea.classList.remove('red')
            }
            
            if(!image) {
                console.log(5);
                errorArea.innerHTML = 'images are mandatory'
                errorArea.classList.add('red')
                return
            } else {
                console.log(6);
                errorArea.innerHTML = ''
                errorArea.classList.remove('red')
            }
            
            if (!subcategory) {
                console.log(7);
                errorArea.innerHTML = 'please provide a subcategory'
                errorArea.classList.add('red')
                return
            }else {
                console.log(8);
                errorArea.innerHTML = 'jayichu'
                errorArea.classList.remove('red')
            }
            
            if(!category) {
                console.log(9);
                errorArea.innerHTML = 'please provide a valid category'
                errorArea.classList.add('red')
                return
            }else {
                console.log(10);
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
    console.log(11);
    const result = response.data
    console.log(12);
    
})