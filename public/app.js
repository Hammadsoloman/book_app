'use strict';

var Humbergerbtn=document.getElementById("humrger-btn");
Humbergerbtn.addEventListener("click",onclickMenu);
var nav=document.getElementById("nav");


function onclickMenu()
{
    Humbergerbtn.classList.toggle("change");
    nav.classList.toggle("change");
    $(".main-header").toggleClass("display");

}