export default function (name, preFix){
    return name ? (' '+(preFix||'')+ name) : ''
}