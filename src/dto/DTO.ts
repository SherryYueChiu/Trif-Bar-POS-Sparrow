export type BartendersDTO = {
  [key: string]: string,
}

// 訂單結構
export type ItemInOrderDTO = {
  productId: string,
  spec: string,
  amount: number,
  finished: boolean,
  preferBartender: number,
}
export type OrderDTO = {
  uuid: string,
  customerName: string,
  orderId: number,
  orderItems: {
    [key: string]: ItemInOrderDTO,
  }
  finished: boolean,
  destroyed: boolean,
  settled?: boolean,
}
export type OrdersDTO = {
  [key: string]: OrderDTO,
}

// 品項結構
export type ProductsDTO = {
  [key: string]: ProductDTO,
}
export type ProductDTO = {
  uuid: string,
  category: string,
  name: string,
  order: number,
  description: string,
  remain: number,
  price: number,
}

// 品項分類
export type CategoryDTO = {
  uuid: string,
  name: string,
  order: number,
}
export type CategoriesDTO = {
  [key: string]: CategoryDTO,
}