// 宣告變數
const BASE_URL = 'https://movie-list.alphacamp.io' //伺服器主機
const INDEX_URL = BASE_URL + '/api/v1/movies/' //命名 API 第一版
const POSTER_URL = BASE_URL + '/posters/' //處理圖片檔案
const movies = [] //存放電影資料(不能隨便更動)
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form') //設置搜尋bar監聽欄位
const searchInput = document.querySelector('#search-input') //搜索框
const MOVIES_PER_PAGE = 12 //每頁顯示的電影數
const paginator = document.querySelector('#paginator') //分頁 
let filteredMovies = [] //搜尋清單

// 撰寫一個函式 renderMovieList 來演算需要的 template literal， 暫存在 rawHTML 這個變數中
//在每個電影裡面新增id 標籤 在彈出視窗時能直接讀到資料
function renderMovieList(data) {
    let rawHTML = ''
    data.forEach((item) => {
        // title, image, id
        rawHTML += `<div class="col-sm-3">
                    <div class="mb-2">
                        <div class="card">
                            <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
                            <div class="card-body">
                            <h5 class="card-title">${item.title}</h5>
                        </div>
                        <div class="card-footer">
                            <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
                            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
                        </div>
                    </div>
                    </div>
                    </div>`
    })
    dataPanel.innerHTML = rawHTML
}

//製作頁碼功能 (依照傳進電影的總數量)
function renderPaginator(amount) {
    const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
    let rawHTML = ''
    for (let page = 1; page <= numberOfPages; page++) {
        rawHTML += `
        <li class="page-item">
        <a class="page-link" href="#" data-page="${page}">${page}</a>
        </li>`
    }
    paginator.innerHTML = rawHTML
}

//頁碼功能-擷取每頁的電影數
function getMoviesByPage(page) {
    const data = filteredMovies.length ? filteredMovies : movies
    const startIndex = (page - 1) * MOVIES_PER_PAGE
    return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

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
        alert('此電影已經在收藏清單中！')
    } else {
        list.push(movie)
        localStorage.setItem('favoriteMovies', JSON.stringify(list))
        alert('加入收藏清單！')
    }

}

//監聽 data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
    if (event.target.matches('.btn-show-movie')) {
        showMovieModal(Number(event.target.dataset.id))
    } else if (event.target.matches('.btn-add-favorite')) { //收藏
        addToFavorite(Number(event.target.dataset.id))
    }
})

//搜尋功能
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
    event.preventDefault() //預防瀏覽器預設行為
    const keyword = searchInput.value.trim().toLowerCase() //將input的值 設為變數並轉為小寫

    filteredMovies = movies.filter((movie) =>
        movie.title.toLowerCase().includes(keyword)
    )

    //錯誤處理：空字串
    if (!keyword.length) {
        return alert('請輸入電影名稱')
    }

    //錯誤處理：無符合條件的結果
    if (filteredMovies.length === 0) {
        return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
    }
    // //對比電影名稱
    // for (const movie of movies) {
    //     if (movie.title.toLowerCase().includes(keyword)) {
    //         filteredMovies.push(movie)
    //     }
    // }


    //將符合搜尋結果的值重新利用renderMovieList的方法印出
    renderPaginator(filteredMovies.length)
        //預設顯示第 1 頁的搜尋結果
    renderMovieList(getMoviesByPage(1))
})

//paginator 監聽器
paginator.addEventListener('click', function onPaginatorClicked(event) {
    if (event.target.tagName !== 'A') return
    const page = Number(event.target.dataset.page)
    renderMovieList(getMoviesByPage(page))

})



axios
    .get(INDEX_URL)
    .then((response) => {
        //push:要改變const內容，只能按址拷貝 (copied by reference)
        //... :使用迭代一個個加進去movies陣列
        movies.push(...response.data.results)
        renderPaginator(movies.length)
        renderMovieList(getMoviesByPage(1)) //電影總數量
            // HTTP 狀態碼
            // console.log(response.status)
    })
    .catch((err) => console.log(err))