import axios from 'axios';

export async function fetchImages(page = 1, searchQuery = '') {
    const apiKey = '41130229-b97acaf2c1e96ee437e7ee928';
    const perPage = 40;
  
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: apiKey,
        q: searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page,
        per_page: perPage,
      },
    });
  
    return response.data;
};