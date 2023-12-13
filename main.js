import './style.css'

let page = 1;
const info = document.getElementById("info");
const API_KEY = import.meta.env.VITE_API_KEY;

async function generateUnsplashPhoto(page , query) {
    let searchUrl = `https://api.unsplash.com/search/photos?client_id=${API_KEY};page=${page}&per_page=30&query=${query}`;
    try {
        const results = await fetch(searchUrl);
        if(results.ok){
            let data = await results.json();
            console.log(data);
            if(!data.total){
                showInfo("No results found");
                throw new Error("No results found");
            }
            let imgUrlsAndAlt = data.results.map(data => [data.urls.regular , data.alt_description]);
            console.log(imgUrlsAndAlt);
            addImagesInDOM(imgUrlsAndAlt , "#imagesContainer" );
            createInfiniteScroll(generateUnsplashPhoto , "#imagesContainer" , query);
        } else {
            showInfo("Error " + results.status);
            document.querySelector("#imagesContainer").classList.remove("d-none");
            throw new Error("Server Error : " + results.status)
            
        }
    } catch (error) {
        console.error(error);
        showInfo("Server Error " + error);
    }
    
}

generateUnsplashPhoto(page , "random");

function addImagesInDOM(imgUrlsAndAlt , idContainer){
    for (let i = 0; i < imgUrlsAndAlt.length; i++) {
        let div = document.createElement("div");
        div.className = "col-md-4 col-12 col-sm-6 image-container";
        div.innerHTML = `<img src="${imgUrlsAndAlt[i][0]}" class="img-fluid" alt="${imgUrlsAndAlt[i][1]}">`;
        document.querySelector(`${idContainer}`).appendChild(div);
    }
}

function createInfiniteScroll(callApiFetch , idContainer , query){
    let lastChildOfImagesContainer = document.querySelector(`${idContainer}`).lastElementChild;
    const observer = new IntersectionObserver((entries) => {
        console.log(entries[0].target)
        console.log(entries[0].isIntersecting);
        if(entries[0].isIntersecting){
            entries[0].target.classList.add("intersecting");
            page++;
            callApiFetch(page , query);
            observer.unobserve(lastChildOfImagesContainer);

        }else {
            entries[0].target.classList.remove("intersecting");
        };
    } , { rootMargin: "50%"});
        observer.observe(lastChildOfImagesContainer);
}

const form = document.getElementById("searchForm");
form.addEventListener("submit", handleFormSubmit);

function handleFormSubmit(e) {
    page = 1;
    e.preventDefault();
    let query = document.getElementById("searchInput").value;
    if(! query) {
        showInfo("Please enter a search term");
    } else {
        info.textContent = "";
        info.classList.add("d-none");
        document.querySelector("#imagesContainer").textContent = "";
        generateUnsplashPhoto(page , query);
    }

}

function showInfo(text){
    info.classList.remove("d-none");
        info.textContent = text;
        // setTimeout(() => {
        //     info.classList.add("d-none");
        // }, 3000) ;
}

let lock = false;
function handleScrollUp(e){
    if (lock) return;
    lock = true;
    window.scrollTo(0, 0);
    setTimeout(() => {
        lock = false;
    }, 1000)
}
const btnScrollUp = document.querySelector(".fixed-icon");

btnScrollUp.addEventListener("click", handleScrollUp);

document.querySelector("#reloadPage").addEventListener("click", () => {
    window.location.reload();
});