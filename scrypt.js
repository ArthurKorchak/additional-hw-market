const instruments = [{
    id: 1,
    img: 'https://static.dnipro-m.ua/cache/products/1754/catalog_origin_141546.jpg',
    name: 'Молоток',
    price: 150
}, {
    id: 2,
    img: 'https://static.dnipro-m.ua/cache/products/5098/catalog_origin_195568.jpg',
    name: 'Перфоратор',
    price: 3000
}, {
    id: 3,
    img: 'https://static.dnipro-m.ua/cache/products/2023/catalog_origin_200763.jpg',
    name: 'Рівень',
    price: 2000
}, {
    id: 4,
    img: 'https://static.dnipro-m.ua/cache/products/1754/catalog_origin_141546.jpg',
    name: 'Молоток Premium+',
    price: 175
}];

const content = document.querySelector('.content');
const currenciesList = document.querySelector('.currenciesList');
const currenciesListFiat = {
    icon: 'https://upload.wikimedia.org/wikipedia/commons/7/7f/PrivatBank-corporate-logo-latina.png',
    href: 'https://privatbank.ua/map'
};
const currenciesListBTC = {
    icon: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Binance_logo.svg',
    href: 'https://www.binance.com/uk-UA/convert'
};
let usdValue;

currenciesOperations()
itemRemover();
storageOperator('Favorite');
storageOperator('Basket');

document.querySelector('.goods').addEventListener ('click', () => elemGen(instruments));
document.querySelector('.fav').addEventListener('click', () => favoriteOperator());
document.querySelector('.basket').addEventListener('click', () => basketOperator());
document.addEventListener('submit', (event) => {
    event.preventDefault();
    const itemName = event.target[0].value;
    event.target[0].value = '';
    elemGen(instruments.filter((elem) => itemName && elem.name.toLowerCase().includes(itemName.toLowerCase())));
});

function storageOperator(param) {
    content.addEventListener("click", (event) => {
    const id = Number(event.target.parentNode.id);
    const currentElem = instruments.find(elem => elem.id === id && event.target.classList.contains(`to${param}`));
        if (currentElem) {
            if (localStorage.getItem(`items${param}`)) {
                const variable = Array.from(JSON.parse(localStorage.getItem(`items${param}`)));
                if (!variable.some((el) => el.id === id)) {
                    variable.push(currentElem);
                    localStorage.setItem(`items${param}`, JSON.stringify(variable));
                };
            } else {
                const start = [];
                start.push(currentElem);
                localStorage.setItem(`items${param}`, JSON.stringify(start));
            };
        };
    });
};

function favoriteOperator() {
    if (localStorage.getItem('itemsFavorite').length > 2) {
        const currentFavoritr = Array.from(JSON.parse(localStorage.getItem('itemsFavorite')));
        elemGen(currentFavoritr);
        content.insertAdjacentHTML("afterbegin", `<div class="contentHead">
            <p>Товарів обрано: ${currentFavoritr.length}</p>
            <button class="favoreClear">🗑️ Очистити обране</button>
        </div>`);
        document.querySelector('.favoreClear').addEventListener('click', () => cleanerAll('Favorite', 'НЕМАЄ ОБРАНОГО!'));
        document.querySelectorAll('.toFavorite').forEach(elem => {
            elem.innerHTML = `Прибрати`;
            elem.classList.replace('toFavorite', 'removeItem');
        });
    } else {
        content.innerHTML = 'НЕМАЄ ОБРАНОГО!';
    };
};

function basketOperator() {
    if (localStorage.getItem('itemsBasket').length > 2) {
        const currentBask = Array.from(JSON.parse(localStorage.getItem('itemsBasket')));
        const totalPrice = currentBask.reduce((acc, el) => { return acc += el.price; }, 0);
        elemGen(currentBask);
        content.insertAdjacentHTML("afterbegin", `<div class="contentHead">
            <p>Товарів у корзині: ${currentBask.length}</p>
            <p>Загальна вартість: ${totalPrice} ₴ (${(totalPrice / usdValue).toFixed(2)} $)</p>
            <button class="buy">✔️ Замовити</button>
            <button class="basketClear">🗑️ Очистити корзину</button>
            </div>`);
        document.querySelector('.buy').addEventListener('click', () => {
            console.log(currentBask);
            localStorage.setItem(`itemsBasket`, []);
            content.innerHTML = '✔️ Обробка замовлення';
        });
        document.querySelector('.basketClear').addEventListener('click', () => cleanerAll('Basket', 'КОРЗИНА ПОРОЖНЯ!'));
        document.querySelectorAll('.toBasket').forEach(elem => {
            elem.remove();
        });
        document.querySelectorAll('.toFavorite').forEach(elem => {
            elem.innerHTML = `Прибрати`;
            elem.classList.replace('toFavorite', 'removeItem');
        });
    } else {
        content.innerHTML = 'КОРЗИНА ПОРОЖНЯ!';
    };
};

function elemGen(instruments) {
    const gen = instruments.reduce((acc, { id, img, name, price }) => {
        return acc +
            `<div class="card" id="${id}">
                <img src="${img}" width="220">
                <div class="foot">
                    <p class="name">${name}</p>
                    <p class="price">${price} ₴<br> (${(price / usdValue).toFixed(2)} $)</p>
                </div>
                <button class="toBasket">Купити</button>
                <button class="toFavorite">Додати в обрані</button>
            </div>`
    }, ``);
    content.innerHTML = `<div class="wrapper">${gen}</div>`;
};

function itemRemover() {
    content.addEventListener('click', (event) => {
        const id = Number(event.target.parentNode.id);
        const isCurrenPlaceBasket = document.querySelector('.buy');
        const isBtnRemove = event.target.classList.contains('removeItem');
        if (isBtnRemove && isCurrenPlaceBasket) {
            const elems = Array.from(JSON.parse(localStorage.getItem(`itemsBasket`))).filter(elem => elem.id !== id);
            localStorage.setItem(`itemsBasket`, JSON.stringify(elems));
            basketOperator();
        } else if (isBtnRemove && !isCurrenPlaceBasket) {
            const elems = Array.from(JSON.parse(localStorage.getItem(`itemsFavorite`))).filter(elem => elem.id !== id);
            localStorage.setItem(`itemsFavorite`, JSON.stringify(elems));
            favoriteOperator();
        };
    });
};

function cleanerAll(data, mass) {
    localStorage.setItem(`items${data}`, []);
    content.innerHTML = `${mass}`;
};

function currenciesOperations() {
    fetch('https://api.privatbank.ua/p24api/pubinfo?exchange&json&coursid=11')
        .then(response => {
            if (!response.ok) {
                throw new Error(response.status);
            }
            return response.json();
        })
        .then(data => {
            currenciesList.innerHTML = data.reduce((acc, { ccy, base_ccy, buy, sale }) => {
                ccy === 'BTC' ? param = currenciesListBTC : param = currenciesListFiat;
                ccy === 'USD' ? usdValue = sale : null;
                if (ccy === 'RUR') { return acc };
                buy = Number(buy).toFixed(2);
                sale = Number(sale).toFixed(2);
                return acc +
                    `<div class="currencieCard">
                    <b class="currencieHead">${ccy} / ${base_ccy}</b>
                    <p class="currencieActions">Купити / Продати</p>
                    <p class="currenciePrice">${sale} / ${buy}</p>
                    <a href="${param.href}" target="_blank">👉<img src="${param.icon}" height="20"></a>
                </div>`
            }, ``);
            elemGen(instruments);
        })
        .catch(error => console.log(error));
};