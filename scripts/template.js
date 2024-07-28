const sections = document.querySelectorAll('.section');
const dots = document.querySelectorAll('.dot');
const fullpage = document.querySelector('.fullpage');

// const dropdown = document.querySelector('.svg-dropdown');
const dropdowns = document.querySelectorAll('.svg-dropdown');

//   dropdowns.forEach(dropdown => {
//     dropdown.style.display = 'none';
//   });

//   if (index === 1) {
//     dropdowns[0].style.display = 'block';
//   } else if (index === 2) {
//     dropdowns[1].style.display = 'block';
//   }


let currentSectionIndex = 0;
let scrollThreshold = 5; // Adjust this threshold as needed

function scrollToSection(index) {
    const sectionHeight = sections[0].clientHeight;
    fullpage.scrollTo({
        top: index * sectionHeight,
        behavior: 'smooth'
    });
    currentSectionIndex = index;
    updateDotColors();
    hideShowDropDown();
}

function hideShowDropDown() {
    if (currentSectionIndex === 2) {
        dropdowns[0].style.display = 'block';
      } else {
        dropdowns[0].style.display = 'none';
      }
}

function updateDotColors() {
    dots.forEach((dot, index) => {
        dot.classList.remove('active');
        if (index === currentSectionIndex) {
            dot.classList.add('active');
        }
    });
}

updateDotColors();

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        scrollToSection(index);
    });
});

// fullpage.addEventListener('scroll', () => {
//     const currentScroll = fullpage.scrollTop;
//     const sectionHeight = sections[0].clientHeight;
//     const scrollDelta = Math.abs(currentScroll - fullpage.scrollTop);

//     // console.log("In scripts.js", "curScroll: " + currentScroll + ", " + "secHeight: " + sectionHeight);
//     // console.log("scollData", "scrollDalta: " + scrollDelta + ", " + "scrollThreshold: " + scrollThreshold);
//     var newIndex = Math.floor(currentScroll / sectionHeight);
//     if (newIndex !== currentSectionIndex && scrollDelta == 0) {
//         newIndex = currentSectionIndex + 1;
//         scrollToSection(newIndex);
//     } else {
//         currentSectionIndex = newIndex;
//         updateDotColors();
//     }

// });
