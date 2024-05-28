

    function addressChanged(event, id, HousName, houseNo, City, pincode) {
      document.querySelector('.housename').value = HousName

      document.querySelector('.city').value = City

      document.querySelector('.houseno').value = houseNo

      document.querySelector('.pin').value = pincode
    }
  


async function applyPromoCode(event) {
  if(document.getElementById("applyBtnCoupon").textContent == 'Apply'){
    const couponvalue= document.getElementById('coupon-input').value
    const response = await axios.post(`/user/setcoupon?couponcode=${couponvalue}`)
            const result = response.data

            if(result.success) {
                document.getElementById('summary').textContent = 'Coupon'
                document.getElementById('camount').textContent = result.discount
                const oldAmount = document.getElementById('Amount').textContent.trim()

                document.getElementById("updatedPrice").textContent = Number(oldAmount)-Number(result.discount)
                document.getElementById("applyBtnCoupon").textContent = 'Remove'
              }
  }
  else if(document.getElementById("applyBtnCoupon").textContent == 'Remove'){
const couponPrice =  document.getElementById('camount').textContent
document.getElementById("updatedPrice").textContent = Number(document.getElementById("updatedPrice").textContent) + Number(couponPrice)
document.getElementById('summary').textContent = 'Summary'
document.getElementById('camount').textContent = ''
document.getElementById("applyBtnCoupon").textContent = 'Apply'

  }

}
  function couponSelect(event) {
    const data = event.target.value
    document.getElementById('coupon-input').value = data

  }
