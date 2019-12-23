document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const customer = document.getElementById('customer'),
        freelancer = document.getElementById('freelancer'),
        blockCustomer = document.getElementById('block-customer'),
        blockFreelancer = document.getElementById('block-freelancer'),
        blockChoice = document.getElementById('block-choice'),
        btnExit = document.getElementById('btn-exit'),
        formCustomer = document.getElementById('form-customer'),
        ordersTable = document.getElementById('orders'),
        modalOrder = document.getElementById('order_read'),
        modalOrderActive = document.getElementById('order_active');

    const orders = JSON.parse(localStorage.getItem('freeOrders')) || [];

    const toStorage = () => {
        localStorage.setItem('freeOrders', JSON.stringify(orders));
    };

    const calcDeadline = (date) => {
        const deadline = new Date(date);
        const toDay = Date.now();
        const remaining = (deadline - toDay) / 1000 / 60 / 60;
        if (remaining / 24 > 2){
            const resultDeadline = (Math.floor(remaining) == 1) ? 
                (Math.floor(remaining/24) + ' day left') : (Math.floor(remaining/24) + ' days left');
            return resultDeadline;
        } else{
            const resultDeadline = (Math.floor(remaining) == 1) ? 
                (Math.floor(remaining) + ' hour left') : (Math.floor(remaining) + ' hours left');
            return resultDeadline;
        }
    };


    const rendedOrders = () => {

        ordersTable.textContent = '';
        orders.forEach((order, i) => {

        ordersTable.innerHTML += `
            <tr class="order ${order.active ? 'taken' : ''}" data-number-order="${i}">
                <td>${i+1}</td>
                <td>${order.title}</td>
                <td class="${order.currency}"></td>
                <td>${calcDeadline(order.deadline)}</td>
            </tr>
            `;
        });
    };

    const handlerModal = (event) => {
        const target = event.target;
        const modal = target.closest('.order-modal');
        const order = orders[modal.id];

        if (target.closest(".close") || target === modal){
            modal.style.display = 'none';
        }

        if(target.classList.contains('get-order')){
            order.active = true;
            modal.style.display = 'none';
            toStorage();
            rendedOrders();
        }

        if(target.id === 'capitulation'){
            order.active = false;
            modal.style.display = 'none';
            toStorage();
            rendedOrders();
        }

        if(target.id === 'ready'){
            orders.splice(orders.indexOf(order), 1);

            modal.style.display = 'none';
            toStorage();
            rendedOrders();
        }
    }

    const openModal = (numberOrder) => {
        const order = orders[numberOrder];

        const { title, firstName, email, phone, description,
            amount, currency, deadline, active = false} = order;

        const modal = active ? modalOrderActive : modalOrder;

        const firstNameBlock = modal.querySelector('.firstName'),
            titleBlock = modal.querySelector('.modal-title'),
            emailBlock = modal.querySelector('.email'),
            descriptionBlock = modal.querySelector('.description'),
            deadlineBlock = modal.querySelector('.deadline'),
            currencyBlock = modal.querySelector('.currency_img'),
            countBlock = modal.querySelector('.count'),
            phoneBlock = modal.querySelector('.phone');

        modal.id = numberOrder;
        titleBlock.textContent = title;
        firstNameBlock.textContent = firstName;
        emailBlock.textContent = email;
        emailBlock.href = 'mailto:' + email;
        descriptionBlock.textContent = description;
        deadlineBlock.textContent = calcDeadline(deadline);
        currencyBlock.className = 'currency_img';
        currencyBlock.classList.add(currency);
        countBlock.textContent = amount;

        phoneBlock ? phoneBlock.href = 'tel:' + phone : '';

        modal.style.display = 'flex';

        modal.addEventListener('click', handlerModal);
    };


    // events ----------------------------------------------------
    ordersTable.addEventListener('click', (event) => {
        const target = event.target;
        const targetOrder = target.closest('.order');

        if(targetOrder){
            openModal(targetOrder.dataset.numberOrder);
        }
    });

    customer.addEventListener('click', () => {
        blockChoice.style.display = 'none';

        const today = new Date().toISOString().substring(0, 10);
        document.getElementById("deadline").min = today;

        blockCustomer.style.display = 'block';
        btnExit.style.display = 'block';
    });

    freelancer.addEventListener('click', () => {
        blockChoice.style.display = 'none';
        rendedOrders();
        blockFreelancer.style.display = 'block';
        btnExit.style.display = 'block';
    });

    btnExit.addEventListener('click', () => {
        btnExit.style.display = 'none';
        blockFreelancer.style.display = 'none';
        blockCustomer.style.display = 'none';
        blockChoice.style.display = 'block';
    });

    formCustomer.addEventListener('submit', (e) => {
        e.preventDefault();
        const obj = {};

        const elements = [...formCustomer.elements]
            .filter((elem) => (elem.tagName === 'INPUT' && elem.type !== 'radio') || 
                            (elem.type === 'radio' && elem.checked) || 
                            elem.tagName === 'TEXTAREA');

        elements.forEach((elem) => {
                obj[elem.name] = elem.value;
        });

        //phone field validation
        const phone = document.getElementById('phone');
        const phoneBlock = document.querySelector('.phone');
        console.log(phone);
        if(isNaN(phone.value) || (phone.value.length != 12)){
            phone.style.border = '1px solid red';
            phoneBlock.style.display = 'block';
            return
        }

        formCustomer.reset();

        orders.push(obj);
        toStorage();
        alert('Your order is successfully created. You can see the details of the order in the section "Freelancer"');
    });

    
});