import { ITreeObject, array2Hierarchy, TreeKey, TREE_ROOT_ID, IHierarchyMap } from "../../util/core";

// we store here the external dependencies, 
// if you use only 1 component then make sense to move here those functions/variables and not import it 
// or simple you can write here your own solutions for external functions :)

export function getPath<T>(items: IHierarchyMap<ITreeObject<T>>, activeId: TreeKey, rootId: TreeKey = TREE_ROOT_ID) {
    const ids: TreeKey[] = [];
    let parent: ITreeObject<T>;

    while (items.valueMap[activeId] && rootId !== activeId) {
        ids.push(activeId);

        parent = items.valueMap[activeId].parent;
        activeId = parent ? parent.id : null;
    }

    return ids;
}

const externalDependencies = {
    array2Hierarchy,
    getPath
};

export default externalDependencies;