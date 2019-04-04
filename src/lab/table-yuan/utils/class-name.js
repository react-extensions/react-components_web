export default function (name, ...args) {
    let i = 0;
    let len = args.length;
    for (; i < len; i++) {
        name += (args[i] ? (' ' + args[i]) : '');
    }
    return name;
}

// function (name, preFix){
//     return name ? (' '+(preFix||'')+ name) : '';
// }