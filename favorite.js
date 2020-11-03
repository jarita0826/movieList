// 宣告變數
const BASE_URL = 'https://movie-list.alphacamp.io' //伺服器主機
const INDEX_URL = BASE_URL + '/api/v1/movies/' //命名 API 第一版
const POSTER_URL = BASE_URL + '/posters/' //處理圖片檔案
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) //收藏清單
const dataPanel = document.querySelector('#data-panel')

//彈跳視窗 - 發送 Request 
function showMovieModal(id) {
    const modalTitle = document.querySelector('#movie-modal-title') //標題
    const modalImage = document.querySelector('#movie-modal-image') //照片
    const modalDate = document.querySelector('#movie-modal-date') //日期
    const modalDescription = document.querySelector('#movie-modal-description') //簡介
    axios
        .get(INDEX_URL + id)
        .then((response) => {
            const data = response.data.results
            modalTitle.innerText = data.title
            modalDate.innerText = 'Release date: ' + data.release_date
            modalDescription.innerText = data.description
            modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
        })
}

//將使用者點擊到的那一部電影送進 local storage 儲存起來
function addToFavorite(id) {
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movie = movies.find((movie) => movie.id === id)
    if (list.some((movie) => movie.id === id)) {
        return alert('此電影已經在收藏清單中！')
    }
    list.push(movie)
    localStorage.setItem('favoriteMovies', JSON.stringify(list))

}

//移除功能
function removeFromFavorite(id) {
    if (!movies) return

    const movieIndex = movies.findIndex((movie) => movie.id === id)
    if (movieIndex === -1) return

    movies.splice(movieIndex, 1)
    localStorage.setItem('favoriteMovies', JSON.stringify(movies))
    renderMovieList(movies)
}

// 撰寫一個函式 renderMovieList 來演算需要的 template literal， 暫存在 rawHTML 這個變數中
//在每個電影裡面新增id 標籤 在彈出視窗時能直接讀到資料
function renderMovieList(data) {
    let rawHTML = ''
    data.forEach((item) => {
        // title, image, id
        rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${
          POSTER_URL + item.image
        }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${
            item.id
          }">More</button>
          <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}"> X </button>
        </div>
      </div>
    </div>
  </div>`
    })
    dataPanel.innerHTML = rawHTML
}

//彈跳視窗 移除收藏
dataPanel.addEventListener('click', function onPanelClicked(event) {
    if (event.target.matches('.btn-show-movie')) {
        showMovieModal(Number(event.target.dataset.id))
            //移除收藏
    } else if (event.target.matches('.btn-remove-favorite')) {
        removeFromFavorite(Number(event.target.dataset.id))
    }
})

renderMovieList(movies)