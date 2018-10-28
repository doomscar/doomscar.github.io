var container = document.querySelector('.section-slide');

slider(container.querySelectorAll('.slide'), container.querySelector('.prev'), container.querySelector('.next'), 0);

function slider(list, prev, next, currentSlide){
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

/*############################################ second_slider #########################################*/

carousel(document.querySelector('.second'), 720, 1);

function carousel(section, width, count){
  section_ul = section.querySelector('.slider');
  section_li = section_ul.querySelectorAll('.slide');

  var position = 0;

  section.querySelector('.prev').onclick = function(){
    position = Math.min(position + width * count, 0);
    section_ul.style.marginLeft = position + 'px';
  }

  section.querySelector('.next').onclick = function(){
    position = Math.max(position - width * count, -width * (section_li.length - count));
    section_ul.style.marginLeft = position + 'px';
  }

}

