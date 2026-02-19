/* eslint-disable arrow-body-style */
import { isUniversalEditorActive } from '../../scripts/scripts.js';
import { loadScript, loadCSS } from '../../scripts/aem.js';

// Debounce Helper
function debounce(fn, wait = 200) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}

export default async function decorate(block) {
  if (isUniversalEditorActive()) return;
  // Wrapping only when section has class "board-cards-container"
  const section = block.closest('.section');
  section?.classList.add('board-cards-container');

  if (section && !isUniversalEditorActive()) {
  // Avoiding double wrapping by checking if container already exists
    if (!section.querySelector(':scope > .container')) {
      const container = document.createElement('div');
      container.className = 'container';

      const row = document.createElement('div');
      row.className = 'row';

      // Moving all children into .row
      Array.from(section.childNodes).forEach((node) => {
        row.appendChild(node);
      });

      // Inserting .container > .row back into the section
      container.appendChild(row);
      section.appendChild(container);
    }
  }

  // Wraping <h2> inside .content inside .default-content-wrapper
  const dcw = block.closest('.section')?.querySelector('.default-content-wrapper');
  if (dcw) {
    dcw.classList.add('board-directors--top-text');
  }

  if (dcw && !dcw.querySelector('.content')) {
    const h2 = dcw.querySelector('h2');
    if (h2) {
      const wrap = document.createElement('div');
      wrap.className = 'content';

      // Moving the h2 INTO the wrapper
      wrap.appendChild(h2);

      // Inserting the wrapper INTO the default-content-wrapper
      dcw.prepend(wrap);
    }
  }

  // Building FINAL CARD MARKUP
  const cards = block.querySelectorAll(':scope > div');

  cards.forEach((card) => {
    const imageDiv = card.querySelector(':scope > div:nth-child(1)');
    const textDiv = card.querySelector(':scope > div:nth-child(2)');
    if (!imageDiv || !textDiv) return;

    const targetValue = card.dataset.target || block.dataset.target || '';

    const wrapper = document.createElement('div');
    wrapper.classList.add('paragraph--board-card');

    const anchor = document.createElement('a');
    anchor.className = 'board-card-link';
    anchor.href = '#';
    anchor.setAttribute('data-toggle', 'area-modal');
    if (targetValue) anchor.setAttribute('data-target', targetValue);

    imageDiv.classList.add('paragraph--board-card--image');
    textDiv.classList.add('paragraph--board-card--text');

    const textLong = document.createElement('div');
    textLong.classList.add('text-long');
    textLong.append(...Array.from(textDiv.childNodes));

    textDiv.append(textLong);
    anchor.append(imageDiv, textDiv);
    wrapper.append(anchor);

    card.replaceWith(wrapper);
  });

  // Capturing orignal cards
  const originalCards = [
    ...block.querySelectorAll('.paragraph--board-card'),
  ].map((card) => card.cloneNode(true));

  let slickInitialized = false;
  let sliderEl = null;

  // Slick Slider Initializer
  async function initSlick() {
    if (slickInitialized) return;

    // Lazy-load slick CSS + JS
    loadCSS(`${window.hlx.codeBasePath}/styles/slick.css`);
    loadCSS(`${window.hlx.codeBasePath}/styles/themes/slick-theme.css`);
    await loadScript('/scripts/jquery.min.js');
    await loadScript('/scripts/slick.min.js');

    // Building carousel wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'paragraph paragraph--wrapper-carousel board-cards-carousel';

    const track = document.createElement('div');
    track.className = 'paragraph-carousel';

    // Moving cloned cards into slick slides
    originalCards.forEach((card) => {
      const slide = document.createElement('div');
      slide.className = 'paragraph--wrapper-carousel--content';
      slide.appendChild(card.cloneNode(true));
      track.appendChild(slide);
    });

    wrapper.appendChild(track);
    block.innerHTML = '';
    block.appendChild(wrapper);

    // Initialize slick
    window.jQuery(track).slick({
      rows: 1,
      rtl: false,
      slide: '',
      slidesPerRow: 1,
      slidesToShow: 3,
      slidesToScroll: 3,
      dots: false,
      initialSlide: 0,
      infinite: false,
      autoplay: false,
      autoplaySpeed: 5000,
      centerMode: false,
      centerPadding: '0px',
      variableWidth: false,
      prevArrow: `<button type="button" class="slick-prev slick-arrow" aria-label="Previous"  style="">
   Previous
   <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" fill="none">
      <rect x="49.6016" y="49.6001" width="49.6" height="49.6" rx="24.8" transform="rotate(-180 49.6016 49.6001)" fill="white"></rect>
      <path d="M28.6016 33.2362C25.3532 29.9878 23.5319 28.1665 20.2835 24.9181L28.6016 16.6001" stroke="#4B6AB4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>
   </svg>
</button>`,
      nextArrow: `
    <button type="button" class="slick-next slick-arrow" aria-label="Next">
      <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" 
           viewBox="0 0 50 50" fill="none">
        <rect width="49.6" height="49.6" rx="24.8" fill="white"/>
        <path d="M21 16.3639C24.2484 19.6123 26.0696 21.4336 
                 29.318 24.682L21 33"
              stroke="#4B6AB4" stroke-width="3" stroke-linecap="round"
              stroke-linejoin="round"/>
      </svg>
    </button>`,
      responsive: [
        {
          breakpoint: 1001,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2,
            centerMode: false,
            variableWidth: false,
          },
        },
        {
          breakpoint: 680,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            centerMode: true,
            centerPadding: '0px',
            variableWidth: false,
          },
        },
      ],
    });

    window.jQuery(track).on('breakpoint', (event, slick) => {
      slick.slickGoTo(0, true);
    });

    sliderEl = track;
    slickInitialized = true;
  }

  // Slick Destroy- restore layout
  function destroySlick() {
    if (!slickInitialized) return;

    // Destroy slick
    window.jQuery(sliderEl).slick('unslick');
    slickInitialized = false;

    // Restore original grid layout
    block.innerHTML = '';
    originalCards.forEach((card) => block.appendChild(card.cloneNode(true)));
  }

  // Handling Responsive Layout
  const updateLayout = () => {
    if (window.innerWidth < 1400) {
      initSlick();
    } else {
      destroySlick();
    }
  };

  updateLayout();
  window.addEventListener('resize', debounce(updateLayout, 200));
}
