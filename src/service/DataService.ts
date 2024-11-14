import firebase from "../firebase";

const db = firebase;

class DataService {
  getDBRoot() {
    return db.ref('/');
  }
  getBartenderDB() {
    return db.ref('/bartenders');
  }
  getOrderDB() {
    return db.ref('/orders');
  }
  getProductCategoryDB() {
    return db.ref('/productCategories');
  }
  getProductDB() {
    return db.ref('/products');
  }

  // create(tutorial) {
  //   return db.push(tutorial);
  // }

  // update(key, value) {
  //   return db.child(key).update(value);
  // }

  // delete(key) {
  //   return db.child(key).remove();
  // }

  // deleteAll() {
  //   return db.remove();
  // }
}

export default new DataService();
