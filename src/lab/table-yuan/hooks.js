import React, {useEffect, useState} from 'react';


export default function useHooks() {
    const [num, setNum] = useState(1);
    useEffect(() => {
        const timer = setInterval(() => {
            setNum(num + 1);
        }, 1000);
        return () => {
            clearInterval(timer);
        };
    });

    return num;
}
