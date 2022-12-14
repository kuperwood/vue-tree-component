import {createStore} from 'vuex'
export const search = (items, identifier, callback = null, siblings = false) => {
    for (let n = items.length - 1; n >= 0; n--) {
        if(items[n].identifier === identifier) {
            if(callback instanceof Function)
                siblings ? callback(items, n) : callback(items[n])
            return true
        } else if(search(items[n].children, identifier, callback, siblings)) return true;
    }
    return false
}

export const deselectAll = (items) => {
    for (let n = items.length - 1; n >= 0; n--) {
        items[n].properties.selected = false
        deselectAll(items[n].children)
    }
    return items
}

export const state = () => {
    return {
        tree: [],
        selected: null
    }
}

export const getters = {
    tree: state => state.tree,
    selected: state => state.selected
}

export const actions = {
    tree({commit}, payload) {
        commit('tree', payload)
    },
    add({commit}, payload) {
        commit('add', payload)
    },
    expand({commit}, identifier) {
        commit('expand', identifier)
    },
    select({commit}, identifier) {
        commit('select', identifier)
    },
    cut({commit}, identifier) {
        commit('cut', identifier)
    }
}

export const mutations = {
    tree(state, tree) {
        state.tree = tree
    },

    add(state, payload) {
        let identifier = payload.to ? payload.to : state.selected

        if(state.tree.length === 0 || identifier == null) {
            state.tree.push(payload.entity)
            return
        }

        search(state.tree, identifier, (entity) => {
            entity.children.push(payload.entity)
        })
    },

    expand(state, identifier) {
        search(state.tree, identifier, (entity) => {
            entity.properties.expanded = !entity.properties.expanded
        })
    },

    deselectAll(state) {
        deselectAll(state.tree)
        state.selected = null
    },

    select(state, identifier) {
        deselectAll(state.tree)
        search(state.tree, identifier, (entity) => {
            if(entity.identifier === state.selected) {
                state.selected = null
                entity.properties.selected = false
                return
            }
            entity.properties.selected = true
            state.selected = entity.identifier;
        })
    },

    cut(state, identifier = null) {
        let cut = identifier == null ? state.selected : identifier
        search(state.tree, cut, (siblings, index) => {
            siblings.splice(index, 1)
            if(!search(state.tree, state.selected))
                state.selected = null
        }, true)
    }
}

export const store = createStore({
    strict: true,
    state,
    actions,
    mutations,
    getters
})
