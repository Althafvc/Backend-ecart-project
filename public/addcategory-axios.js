const submitbutton = document.getElementById('submit')
let datas = []

function subcategoryAdding () {

    const subValue =document.getElementById('sub').value
    datas.push(subValue)

    document.getElementById('sub').value=''
}
submitbutton.addEventListener('click',async (event)=>{
    event.preventDefault()
const category = document.getElementById('category').value
const image = document.getElementById('imageInput').files[0]

    const form = new FormData()
    form.append('category',JSON.stringify(category))
    form.append('subcategory',JSON.stringify(datas))
    form.append('category_img',image)


    try {
        const url = '/admin/addcategory'
        const response = await axios.post(url, form,{
            headers:{
                'Content-Type':'multipart/form-data'
            }
        })
        const result = response.data
         console.log(result);
        if(!result.success) {
            
            console.log('image not found')

        } else {
           console.log('Done');
    }
        }

    catch(err) {
        console.log('axios error',err);
    }
})
