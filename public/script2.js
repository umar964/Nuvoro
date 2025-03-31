document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");
      const sizeOptions = document.querySelectorAll('.size-option');

      sizeOptions.forEach(option => {
          option.addEventListener('click', () => {
            console.log("option clicked");
              // Remove 'selected' class from all options
              sizeOptions.forEach(opt => opt.classList.remove('selected'));

              // Add 'selected' class to the clicked option
              option.classList.add('selected');

              // Find the radio input inside the clicked div
              const radioInput = option.querySelector('input[type="radio"]');
              
              // If radio input is found, mark it as checked
              if (radioInput) {
                  radioInput.checked = true;

                  // Update the selected size display
                  document.getElementById('selectedSizeDisplay').textContent = radioInput.value;
              }
          });
      });
  });


 

  document.addEventListener('DOMContentLoaded', () => {
      console.log("DOM fully loaded and parsed");

      const colorOptions = document.querySelectorAll('.color-option');
   

       colorOptions.forEach(option => {
          option.addEventListener('click', (event) => {
              console.log(' color option clicked:', event.currentTarget); // Log the clicked element
              // Remove 'selected' class from all options
               colorOptions.forEach(opt => opt.classList.remove('selected'));

              // Add 'selected' class to the clicked option
              event.currentTarget.classList.add('selected');

              // Find the radio input inside the clicked div
              const radioInput = event.currentTarget.querySelector('input[type="radio"]');
              
              // If radio input is found, mark it as checked
              if (radioInput) {
                  radioInput.checked = true;

                  // Update the selected  color display
                  document.getElementById('selected colorDisplay').textContent = radioInput.value;
              }
          });
      });
  });

 

  document.addEventListener("DOMContentLoaded",()=>{
    const decreasebtn = document.getElementById("decrease");
    const increasebtn = document.getElementById("increase");
    const  quantityInput = document.getElementById("quantity");
   
 
    decreasebtn.addEventListener('click', () => {
        let currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
          
        }
    });

    increasebtn.addEventListener('click', () => {
        let currentValue = parseInt(quantityInput.value);
        quantityInput.value = currentValue + 1;
     
    });

  });



  document.addEventListener('DOMContentLoaded',()=>{
    const remove  = document.getElementById("remove-btn");
    remove.addEventListener("click",)
  })
 
 





  
    const image = document.getElementById('zoom-img');
    const container = document.querySelector('.shoppingleft');

    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate percentages
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;

        // Set image transform origin for zoom
        image.style.transformOrigin = `${xPercent}% ${yPercent}%`;
        image.classList.add('zoomed');
    });

    container.addEventListener('mouseleave', () => {
        image.classList.remove('zoomed');
    });


 

 