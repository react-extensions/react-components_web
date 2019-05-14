export default function (...args) {
    if(!args.length || args.length === 1){
        return args[0];
    }
    return args.filter(Boolean).join(` `);
};
