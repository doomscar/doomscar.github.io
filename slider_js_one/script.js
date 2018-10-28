slider = function(list, prev, next, currentSlide){
  next.onclick = function() {
    if(currentSlide === list.length-1)
    {
      list[currentSlide].classList.remove('show');
      list[0].classList.add('show');
      currentSlide = 0;
    }
    else
    {
      list[currentSlide].classList.remove('show');
      list[currentSlide+=1].classList.add('show');
    }
  }
  
  prev.onclick = function() {
    if(currentSlide === 0)
    {
      list[currentSlide].classList.remove('show');
      currentSlide = list.length-1;
      list[currentSlide].classList.add('show');
    }
    else
    {
      list[currentSlide].classList.remove('show');
      list[currentSlide-=1].classList.add('show');
    }
  }
}

slider(document.querySelectorAll('.slide'), document.querySelector('.prev'), document.querySelector('.next'), 0);