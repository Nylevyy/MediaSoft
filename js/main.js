"use strict";
const addContactButton = document.getElementById('addContactButton');
const createContactButton = document.getElementById('createContactButton');
const returnButton = document.getElementById('returnButton');
const contactList = document.querySelector('.contact-list');
const modal = document.getElementById('modal');
const search = document.getElementById('search');

const contacts = new Map(); // Храним все существующие контакты здесь

// Открываем/закрываем модальное окно
function toggleModal() {
    modal.classList.toggle('hidden');
}

// Обрабатываем клик по кнопке "Добавить"
function openModal(e) {
    e.preventDefault();
    search.value = null;    // Очищаем поле ввода для поиска
    filter();               // Инициализируем все контакты
    toggleModal();
}

// Обрабатываем клик по кнопке "Назад"
function closeModal(e) {
    e.preventDefault();

    // Очищаем поля
    document.getElementById('name').value = null;
    document.getElementById('phone').value = null;
    document.getElementById('setFavourite').value = null;

    toggleModal()
}

// Переключаем контакту статус "Избранное"
function toggleFavourite(e) {
    const item = e.target.closest('.contact-list-item');    // Сам контакт
    const isFavourite = item.contactInfo.isFavourite;       // Актуальный статус
    item.contactInfo.isFavourite = !isFavourite;            // Переключаем статус
    changeFavouriteIcon(item);
    sortList();
}

// Меняем иконку Избранное
function changeFavouriteIcon(item) {
    item.querySelector('.favourites-label').classList.toggle('checked')
}

// Обрабатываем клик по кнопке "Создать"
function submitModal(e) {
    e.preventDefault();
    if (validateModal()) {
        createContact();

        // Очищаеам поля
        document.getElementById('name').value = null;
        document.getElementById('phone').value = null;
        document.getElementById('setFavourite').checked = null;

        sortList();
        toggleModal()
    }
}

// Валидация полей
function validateModal() {
    const nameInput = document.getElementById('name').value;
    const phoneInput = document.getElementById('phone').value;

    if (nameInput && phoneInput) {                  // Проверяем наличие пустых полей

        if (contacts.has(nameInput)) {              // Проверяем существование контакта с таким именем
            alert('Контакт уже существует');
            return false
        } else return true

    } else {
        alert('Поля Имя и Номер телефона обязательны');     // При наличии пустых полей
        return false
    }
}

// Замыкаем index, Функция возвращает сам контакт
const newContact = closureForNewContact();

// Создаем index. Оборачиваем newContact
function closureForNewContact() {

    // Каждый контакт имеет уникальный индекс
    let index = 0;

    return function (newName, newPhone, isFavourite) {
        const name = newName;
        const phone = newPhone;
        const contactListItem = document.createElement('li');
        contactListItem.className = 'contact-list-item';
        contactListItem.contactInfo = {name, phone, isFavourite, index};
        contactListItem.insertAdjacentHTML('afterbegin', `
            <div class="wrapper">
                <div class="contact">
                    <div class="contact-img">
                        <img src="img/people.svg" alt="profile-img" class="profile-img">
                    </div>
                    <div class="contact-info">
                        <span class="contact-info-name">${name}</span>
                        <span class="contact-info-phone">${phone}</span>
                    </div>
                </div>
                <div class="contact-actions">
                    <div class="contact-delete">
                        <button class="delete-button" id="deleteButton${index}">
                            <img src="img/close.svg" alt="close">
                        </button>
                    </div>
                    <div class="favourites-wrapper">
                        <form action="" class="favourites-form">
                            <input type="checkbox" class="favourites-input" name="favourite" id="favourite${index}">
                            <label for="favourite${index}" class="favourites-label"></label>
                        </form>
                    </div>
                </div>
            </div>
        `);
        if (isFavourite) {
            changeFavouriteIcon(contactListItem)
        }
        index++;
        return contactListItem
    };

}

// Создаем контакт
function createContact() {
    const nameInput = document.getElementById('name').value;
    const phoneInput = document.getElementById('phone').value;

    contacts.set(nameInput, phoneInput); // Помещаем в Map

    const setFavourite = document.getElementById('setFavourite').checked;

    const listItem = newContact(nameInput, phoneInput, setFavourite);

    contactList.insertAdjacentElement('beforeend', listItem);   // Помещаем контакт в список

    const index = listItem.contactInfo.index;
    const deleteButton = document.getElementById('deleteButton' + index);
    const favouriteButton = document.getElementById('favourite' + index);

    // Создаем обработчики для кнопок "Удалить" и "Избранное"
    deleteButton.addEventListener('click', deleteContact);
    favouriteButton.addEventListener('change', toggleFavourite)
}

// Удаляем контакт
function deleteContact(e) {
    const contact = e.target.closest('.contact-list-item');
    contacts.delete(contact.contactInfo.name);                  // Удаляем контакт из Map
    contact.remove();                                           // Удаляем сам контакт
}

// Сортируем контакты
function sortList() {

    let favouritesCount = 0;                                           // Число Избранных контактов

    const list = Array.from(document.querySelectorAll('.contact-list-item')); // Массив всех контактов
    contactList.textContent = '';                                  // Удаляем несортированный список

    // Считаем число Избранных контактов
    list.forEach(item => {
       const isFavourite = item.contactInfo.isFavourite;
       if (isFavourite) favouritesCount++
    });

    // Выводим Избранные в начало...
    list.sort((a,b) => {
        if (a.contactInfo.isFavourite > b.contactInfo.isFavourite) return -1;
        else return 1
    });

    // ... и отделяем от остального массива
    const favourites = list.splice(0, favouritesCount);

    // Вставляем Избранные в начало, начиная с недавно добавленных
    favourites.forEach(item => {
        contactList.insertAdjacentElement('afterbegin', item)
    });

    // Сортируем остальной список
    list.sort((a, b) => {
        if (a.contactInfo.name.toString() > b.contactInfo.name.toString()) return 1;
        else return -1
    }).forEach( item => {           // и вставляем
        contactList.insertAdjacentElement('beforeend', item)
    });
}

// Фильтруем элементы по поиску
function filter() {
    // Переводим все значения в прописную строку
    const find = search.value.toString().toLowerCase();
    Array.from(contactList.querySelectorAll('.contact-list-item')).forEach(item => {
        if (!item.contactInfo.name.toLowerCase().includes(find)) item.classList.add('hidden');
        else item.classList.remove('hidden')
    });
}


addContactButton.addEventListener('click', openModal);
createContactButton.addEventListener('click', submitModal);
returnButton.addEventListener('click', closeModal);
search.addEventListener('keyup', filter);





// МАСКА НЕ МОЯ

window.addEventListener("DOMContentLoaded", function() {
    function setCursorPosition(pos, elem) {
        elem.focus();
        if (elem.setSelectionRange) elem.setSelectionRange(pos, pos);
        else if (elem.createTextRange) {
                var range = elem.createTextRange();
                range.collapse(true);
                range.moveEnd("character", pos);
                range.moveStart("character", pos);
                range.select()
            }
    }

    function mask(event) {
        var matrix = "+7 (___) ___ ____",
            i = 0,
            def = matrix.replace(/\D/g, ""),
            val = this.value.replace(/\D/g, "");

        if (def.length >= val.length) val = def;
        this.value = matrix.replace(/./g, function(a) {
            return /[_\d]/.test(a) && i < val.length ? val.charAt(i++) : i >= val.length ? "" : a
        });
        if (event.type == "blur") {
            if (this.value.length == 2) this.value = ""
        } else setCursorPosition(this.value.length, this)
    };
    var input = document.querySelector("#phone");
    input.addEventListener("input", mask, false);
    input.addEventListener("focus", mask, false);
    input.addEventListener("blur", mask, false);
});
