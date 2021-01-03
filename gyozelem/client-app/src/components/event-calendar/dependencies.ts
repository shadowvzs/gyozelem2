import { capitalize, getDeepProp } from "../../util/core";
import { getMonthInfo, toDate, setDate, deltaDate, setTime, betweenDate, to2digit } from "../../util/date";

// we store here the external dependencies, 
// if you use only 1 component then make sense to move here those functions/variables and not import it 
// or simple you can write here your own solutions for external functions :)

const externalDependencies = {
    capitalize,
    getDeepProp,
    getMonthInfo, 
    toDate, 
    setDate, 
    deltaDate, 
    setTime, 
    betweenDate, 
    to2digit,
};

export default externalDependencies;