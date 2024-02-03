const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const passwordRegex =/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/

const email = document.getElementById('email')
const labemail = document.querySelector('.labemail')
const password = document.getElementById('password')
const labepassword = document.querySelector('.labepassword')
const username = document.getElementById('username')
const labeusername = document.querySelector('.labeusername')
const phone = document.getElementById('phone')
const labephone = document.querySelector('.labephone')
const confirmpassword = document.getElementById('confirmpassword')
const labeconfirmpassword = document.querySelector('.labeconfirmpassword')






email.onblur =()=>{
    if(!emailRegex.test(email.value)){
        labemail.innerHTML='invalid E-mail format'
        labemail.classList.add('red')
    }else {
        labemail.innerHTML ='Your Email'
        labemail.classList.remove('red')
    }
}

password.onblur =()=>{
    if(!passwordRegex.test(password.value)){
        labepassword.innerHTML='invalid password format'
        labepassword.classList.add('red')
    }else {
        labepassword.innerHTML ='Password'
        labepassword.classList.remove('red')
    }
}

username.onblur =()=>{
    if(!username.value){
        labeusername.innerHTML='This field is mandatory'
        labeusername.classList.add('red')
    }else {
        labeusername.innerHTML ='Your Name'
        labeusername.classList.remove('red')
    }
}

phone.onblur =()=>{
    if(!phone.value){
        labephone.innerHTML='This field is mandatory'
        labephone.classList.add('red')
    }else {
        labephone.innerHTML ='Your Name'
        labephone.classList.remove('red')
    }
}

confirmpassword.onblur = ()=> {
    if(password.value!=confirmpassword.value) {
        labeconfirmpassword.innerHTML = 'password and confirmpassword fields does not match'
        labeconfirmpassword.classList.add('red')
    }else {
        labeconfirmpassword.innerHTML = 'Repeat your password'
        labeconfirmpassword.classList.remove('red')

    }
}







