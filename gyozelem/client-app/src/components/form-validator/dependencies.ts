import { 
    objFor,
    objValues,
    forEach,
    flat,
} from "../../core/util/performance";

import { getDeepProp } from "../../core/util/core";

// we store here the external dependencies, 
// if you use only 1 component then make sense to move here those functions/variables and not import it 
// or simple you can write here your own solutions for external functions :)

const externalDependencies = {
    objFor,
    objValues,
    forEach,
    flat,
    getDeepProp
};

export default externalDependencies;