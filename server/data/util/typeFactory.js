const { v4: uuid } = require('uuid')
const { db } = require('./firebase')

const op = d => d

const typeFactory = (type, { beforeCreate = op, beforeUpdate = op, afterGet = op }) => {
  const create = async (_data) => {
    const data = await beforeCreate(_data)
    const id = data.id || uuid()
    data.id = id

    const ref = db.collection(type).doc(id)
    const doc = await ref.get()

    if (doc.exists) {
      await ref.update(data)
    } else {
      await ref.set(data)
    }
    return data
  }

  const createMultiple = async (_data) => {
    const data = _data[type]
    const results = await Promise.all(data.map(datum => create(datum)))
    return results
  }

  const get = async (id) => {
    const ref = db.collection(type).doc(id)
    const doc = await ref.get()

    if (!doc.exists) {
      return undefined
    }

    const modified = afterGet(doc.data())
    return modified
  }

  const getMultiple = async (_data) => {
    const data = _data[type]
    const results = await Promise.all(data.map(datum => get(datum)))
    return results
  }

  const search = async (_data) => {
    let query = db.collection(type)

    const rules = _data.rules || []
    rules.forEach(rule => {
      query = query.where(rule[0], rule[1], rule[2])
    })
    const promises = []
    const res = await query.get()
    if (!res.docs) { return [] }

    res.docs.forEach(doc => {
      const data = {
        ...doc.data(),
        id: doc.id
      }
      const modified = afterGet(data)
      promises.push(modified)
    })

    return await Promise.all(promises)
  }

  const update = async (_data) => {
    const data = await beforeUpdate(_data)

    const { id } = data
    const ref = db.collection(type).doc(id)
    await ref.update(data)
    return data
  }

  const updateMultiple = async (_data) => {
    const data = _data[type]
    const results = await Promise.all(data.map(datum => update(datum)))
    return results
  }

  const deleteOne = async (id) => {
    const ref = db.collection(type).doc(id)
    return await ref.delete()
  }

  return {
    create,
    createMultiple,
    get,
    getMultiple,
    update,
    updateMultiple,
    search,
    delete: deleteOne
  }
}



module.exports = typeFactory