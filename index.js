let g = Canva2D.getAPI();



const main = () => {
    let l = g.Launcher();
    l.then(e => console.log(e));
};

addEventListener("load", main);