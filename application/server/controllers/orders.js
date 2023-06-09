/**
 * Project Title: FoodFeast - Full Stack Web Application
 * 
 * Filename: orders.js
 * Created on: 03/23
 * Author(s):
 * Contact: 
 * Copyright (c) 2023 by San Francisco State University
 * 
 * Description: This module handles order-related operations, including fetching and creating orders, 
 *    and getting order items.
 * 
 */
const db = require('../db');
const moment = require('moment');

const getOrdersByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const q = 'SELECT * FROM food_orders WHERE customer_id = ?';
    db.query(q, [userId], (error, results) => {
      if (error) {
        res.status(500).json(error);
      } else {
        res.status(200).json(results);
      }
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

const getOrderItemsByOrderId = async (req, res) => {
  const { orderId } = req.params;

  try {
    const q = 'SELECT * FROM order_items WHERE order_id = ?';
    db.query(q, [orderId], (error, results) => {
      if (error) {
        res.status(500).json(error);
      } else {
        res.status(200).json(results);
      }
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = (io) => {
  const changeOrderStatus = async (req, res) => {
    const { orderId, orderStatus } = req.body;

    console.log(`[Backend--changeOrderStatus] Changing order status for order ${orderId} to "${orderStatus}"`);


    try {
      const q = 'UPDATE food_orders SET order_status = ? WHERE order_id = ?';

      db.query(q, [orderStatus, orderId], (error, results) => {
        if (error) {
          res.status(500).json(error);
        } else {
          res.status(200).json(results);

          const orderDetailsQuery = `
            SELECT fo.order_id, fo.order_date, fo.order_total, fo.delivery_address, fo.special_instructions, fo.order_accepted_by_driver, r.name, r.est_delivery_time, r.phone
            FROM food_orders fo
            JOIN restaurants r ON fo.restaurant_id = r.id
            WHERE fo.order_id = ?
          `;

          db.query(orderDetailsQuery, [orderId], (error, orderDetailsResults) => {
            if (error) {
              console.error('Error fetching order details:', error);
            } else {
              console.log(`[Backend--changeOrderStatus] Successfully changed order status for order ${orderId} to "${orderStatus}"`);

              const orderDetails = orderDetailsResults[0];
              if (orderStatus === 'In Progress') {
                io.to('drivers').emit('orderInProgress', orderDetails);
              }
            }
          });
        }
      });
    } catch (err) {
      res.status(500).json(err);
    }
  };

  const getOrdersByRestaurantId = async (req, res) => {
    const { restaurantId } = req.params;
  
    console.log('restaurantId', restaurantId)
  
    try {
      const q = 'SELECT *, order_accepted_by_driver FROM food_orders WHERE restaurant_id = ?';
      db.query(q, [restaurantId], (error, results) => {
        if (error) {
          console.error("Error fetching orders:", error);
          res.status(500).json({ message: "Error fetching orders" });
        } else {
          res.status(200).json(results);
        }
      });
    } catch (err) {
      console.error("Error fetching orders:", err);
      res.status(500).json({ message: "Error fetching orders" });
    }
  };

  const checkOrderAcceptedByDriver = async (req, res) => {
  const { orderId } = req.params;

  try {
    const q = 'SELECT order_accepted_by_driver FROM food_orders WHERE order_id = ?';
    db.query(q, [orderId], (error, results) => {
      if (error) {
        res.status(500).json(error);
      } else {
        res.status(200).json(results[0]);
      }
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

  

  const addOrderItem = async (orderId, cartItems) => {
    try {
      const q = "INSERT INTO order_items (order_id, menu_item_id, quantity, price, item_total, special_requests) VALUES (?, ?, ?, ?, ?, ?)";
      for (let i = 0; i < cartItems.length; i++) {
        db.query(q, [orderId, cartItems[i].itemId, cartItems[i].itemQuantity, cartItems[i].price, cartItems[i].itemQuantity * cartItems[i].price, cartItems[i].specialRequests || " "],
          (error, results) => {
            if (error) {
              console.log(error.message);
              res.send({ message: "could not insert order items" });
            }
          });
      }
    } catch (error) {
      console.log("Error adding order item: ", error);
      throw error;
    }
  };

  const createOrder = async (req, res) => {
    const {
      customerId,
      restaurantId,
      orderDate,
      orderStatus,
      orderTotal,
      deliveryAddress,
      paymentMethod,
      specialInstructions,
      cartItems,
    } = req.body;
    const formattedOrderDate = moment(orderDate).format("YYYY-MM-DD HH:mm:ss");

    try {
      const q = `
          INSERT INTO food_orders
          (customer_id, restaurant_id, order_date, order_status, order_total, delivery_address, payment_method, special_instructions)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
      db.query(
        q,
        [
          customerId,
          restaurantId,
          formattedOrderDate,
          orderStatus,
          orderTotal,
          deliveryAddress,
          paymentMethod,
          specialInstructions,
        ],
        (error, result) => {
          if (error) {
            console.error("Error creating order:", error);
            res.status(500).json({ message: "Error creating order" });
          } else {
            const newOrder = {
              order_id: result.insertId,
              customer_id: customerId,
              restaurant_id: restaurantId,
              order_date: formattedOrderDate,
              order_status: orderStatus,
              order_total: orderTotal,
              delivery_address: deliveryAddress,
              payment_method: paymentMethod,
              special_instructions: specialInstructions,
              cartItems,
            };
            res.status(201).json(newOrder);

            io.to(restaurantId).emit("newOrder", newOrder);
            io.to("drivers").emit("newOrder", newOrder);
            addOrderItem(result.insertId, cartItems);
          }
        }
      );
    } catch (err) {
      console.error("Error creating order:", err);
      res.status(500).json({ message: "Error creating order" });
    }
  };


  const setOrderAcceptedByDriver = async (req, res) => {
    const { orderId } = req.body;

    try {
      const q = 'UPDATE food_orders SET order_accepted_by_driver = 1 WHERE order_id = ?';
      db.query(q, [orderId], (error, results) => {
        if (error) {
          res.status(500).json(error);
        } else {
          res.status(200).json(results);
          io.to('drivers').emit('orderAccepted', orderId);
        }
      });
    } catch (err) {
      res.status(500).json(err);
    }
  };

  const setOrderAsPickedUp = async (req, res) => {
    const { orderId } = req.params;

    try {
      const q = 'UPDATE food_orders SET order_status = "Out for Delivery" WHERE order_id = ?';
      db.query(q, [orderId], (error, results) => {
        if (error) {
          res.status(500).json(error);
        } else {
          res.status(200).json(results);
        }
      });
    } catch (err) {
      res.status(500).json(err);
    }
  };


  const getUnacceptedOrders = async (req, res) => {
    try {
      const q = `
        SELECT fo.*, r.name, r.est_delivery_time, r.address, r.phone
        FROM food_orders fo
        JOIN restaurants r ON fo.restaurant_id = r.id
        WHERE fo.order_accepted_by_driver = 0
      `;
      db.query(q, (error, results) => {
        if (error) {
          res.status(500).json(error);
        } else {
          res.status(200).json(results);
        }
      });
    } catch (err) {
      res.status(500).json(err);
    }
  };

  const setOrderAsDelivered = async (req, res) => {
    const { orderId } = req.params;

    try {
      const q = 'UPDATE food_orders SET order_status = "Delivered" WHERE order_id = ?';
      db.query(q, [orderId], (error, results) => {
        if (error) {
          res.status(500).json(error);
        } else {
          res.status(200).json(results);
        }
      });
    } catch (err) {
      res.status(500).json(err);
    }
  };



  return {
    getOrdersByUserId,
    getOrdersByRestaurantId,
    createOrder,
    getOrderItemsByOrderId,
    changeOrderStatus,
    setOrderAcceptedByDriver,
    getUnacceptedOrders,
    setOrderAsDelivered,
    setOrderAsPickedUp,
    checkOrderAcceptedByDriver
  };
};