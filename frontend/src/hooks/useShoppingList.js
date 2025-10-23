import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { base_url } from '../utils/constant'

const useShoppingList = () => {
    const [shoppingList, setShoppingList] = useState()

    const getShoppingList = async()=>{
        try {
            const res = await axios.get(`${base_url}/shopinglists/`,{
                headers: {
                    Authorization: "Bearer "+ localStorage.getItem("token")
                }
            })
            console.log("Shopping list",res.data)
            setShoppingList(res.data)
        } catch (error) {
            console.error(error)
        }

    }

    useEffect(()=>{
        getShoppingList()
    },[])

  return {shoppingList}
}

export default useShoppingList