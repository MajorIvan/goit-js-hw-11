import { fetchImages } from './api.js';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import "simplelightbox/dist/simple-lightbox.min.css";

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let page = 1;
let searchQuery = '';
let loadedImagesCount = 0;
loadMoreBtn.style.display= 'none';

form.addEventListener('submit', async function (event) {
  event.preventDefault();
  searchQuery = event.target.elements.searchQuery.value.trim();

  if (!searchQuery) {
    Notiflix.Notify.warning('Please enter a search query');
    return;
  };

  page = 1;
  loadedImagesCount = 0;
  gallery.innerHTML = ''; //clear gallery

  try {
    const data = await fetchImages(page, searchQuery);
    if (data.hits.length === 0) {
      Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    } else {
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
      window.addEventListener('scroll', scrollLoadMore)
      handleResponse(data);
    };
  } catch (error) {
    console.error('Error fetching images:', error);
    Notiflix.Notify.failure('Something went wrong. Please try again.');
  };
});

function scrollLoadMore() {
  const scrollHeight = document.documentElement.scrollHeight;
  const scrollTop = window.scrollY;
  const clientHeight = document.documentElement.clientHeight;

  if (scrollHeight - (scrollTop + clientHeight) < 1) {
    loadMoreImages();
  };
};

async function loadMoreImages() {
  page += 1;
  try {
    const data = await fetchImages(page, searchQuery);
    handleResponse(data);
  } catch (error) {
    console.error('Error fetching more images:', error);
    Notiflix.Notify.failure('Failed to load more images. Please try again.');
  };
};

const lightbox = new SimpleLightbox('.photo-card a', {
    captionDelay: 250,
    overlayOpacity: 0.5
});

function handleResponse(data) {
  const { hits, totalHits } = data;

  gallery.insertAdjacentHTML('beforeend', createImageCard(hits));
  lightbox.refresh();
  smoothScrollToGallery();

  loadedImagesCount += hits.length;

  if (loadedImagesCount >= totalHits) {
    Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    window.removeEventListener('scroll', scrollLoadMore)
  };
};

function createImageCard(hit) {
  return hit.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => `
    <div class="photo-card">
      <a href="${largeImageURL}" data-lightbox="gallery">
        <img 
        class="card-img" 
        src="${webformatURL}" 
        alt="${tags}" 
        loading="lazy">
      </a>
      <div class="info">
        <p class="info-item"><b>Likes</b> ${likes}</p>
        <p class="info-item"><b>Views</b> ${views}</p>
        <p class="info-item"><b>Comments</b> ${comments}</p>
        <p class="info-item"><b>Downloads</b> ${downloads}</p>
      </div>
    </div>
  `).join('');
};

if (gallery.childElementCount > 0) {
    lightbox.next();
};

function smoothScrollToGallery() {
  const { height: cardHeight } = document.querySelector('.photo-card').getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
};