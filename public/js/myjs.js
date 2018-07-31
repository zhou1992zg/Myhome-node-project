var menuMain = document.getElementById('menu-main');
var menuMainLi = document.getElementsByClassName('portfolio-li-li');
var singlePage = document.getElementsByClassName('single-page');
for(var i=0;i<menuMainLi.length;i++){
    menuMainLi[i].index = i;
    menuMainLi[i].onclick=function(){
        i = this.index;
        console.log(i);
        document.documentElement.scrollTop = singlePage[i].offsetTop - 58;
    }
}
