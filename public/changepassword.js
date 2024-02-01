const passwordRegex =/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/
console.log('hello') 
const newpassword = document.getElementById('newpassword')
const labenewpassword = document.querySelector('.lebenewpassword')

const confirmpassword = document.getElementById('confirmpassword')
const labeconfirmpassword = document.querySelector('.labeconfirmpassword')

newpassword.onblur = ()=> {

    if(!passwordRegex.test(newpassword.value)) {
        labenewpassword.innerHTML='invalid password format'
        labenewpassword.classList.add('red')

    }else {
        labenewpassword.innerHTML='New Password'
        labenewpassword.classList.remove('red')
    }


}

