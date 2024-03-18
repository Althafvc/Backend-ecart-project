const sort1Btn = document.querySelector('.sort1').addEventListener('click', async (event) => {
    event.preventDefault();
    const criteria = event.target.textContent; // Retrieve the text content of the clicked element
    window.location.href = `/user/sort?criteria=${criteria}`
});


const sort2Btn = document.querySelector('.sort2').addEventListener('click', async (event) => {
    event.preventDefault();
    const criteria = event.target.textContent; 
    window.location.href = `/user/sort?criteria=${criteria}`
});